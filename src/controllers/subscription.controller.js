const subscriptionService = require('../services/subscription.service');
const stripeService = require('../services/stripe.service');
const db = require('../models');
const ApiResponse = require('../../shared/utils/response');
const logger = require('../../shared/utils/logger');


class SubscriptionController {
  async getPlans(req, res) {
    try {
      const plans = await db.Plan.findAll({
        where: { isActive: true },
        order: [['price', 'ASC']]
      });

      return ApiResponse.success(res, plans, 'Plans retrieved successfully');
    } catch (error) {
      logger.error('Get plans error:', error);
      return ApiResponse.error(res, 'Failed to retrieve plans', 500);
    }
  }

  async getMySubscription(req, res) {
    try {
      const details = await subscriptionService.getSubscriptionDetails(req.user.id);
      return ApiResponse.success(res, details, 'Subscription details retrieved');
    } catch (error) {
      logger.error('Get subscription error:', error);
      return ApiResponse.error(res, 'Failed to retrieve subscription', 500);
    }
  }

  async createCheckoutSession(req, res) {
    try {
      const { planId } = req.body;

      const plan = await db.Plan.findByPk(planId);
      if (!plan) {
        return ApiResponse.error(res, 'Plan not found', 404);
      }

      const user = await db.User.findByPk(req.user.id);

      const existingSubscription = await db.Subscription.findOne({
        where: { userId: user.id, status: 'active' }
      });

      if (existingSubscription) {
        return ApiResponse.error(res, 'You already have an active subscription', 400);
      }

      const successUrl = `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/subscription/cancel`;

      const session = await stripeService.createCheckoutSession(
        user,
        plan.stripePriceId,
        successUrl,
        cancelUrl
      );

      return ApiResponse.success(res, {
        checkoutUrl: session.url,
        sessionId: session.id
      }, 'Checkout session created');
    } catch (error) {
      logger.error('Create checkout session error:', error);
      return ApiResponse.error(res, 'Failed to create checkout session', 500);
    }
  }

  async changePlan(req, res) {
    try {
      const { planId } = req.body;
      const userId = req.user.id;

      const currentSubscription = await db.Subscription.findOne({
        where: { userId, status: 'active' },
        include: [{ model: db.Plan, as: 'plan' }]
      });

      if (!currentSubscription) {
        return ApiResponse.error(res, 'No active subscription found', 404);
      }

      const newPlan = await db.Plan.findByPk(planId);
      if (!newPlan) {
        return ApiResponse.error(res, 'Plan not found', 404);
      }

      if (newPlan.price > currentSubscription.plan.price) {
        // Upgrade
        const result = await subscriptionService.upgrade(userId, planId);
        return ApiResponse.success(res, result, 'Plan upgraded successfully');
      } else if (newPlan.price < currentSubscription.plan.price) {
        // Downgrade
        const result = await subscriptionService.downgrade(userId, planId);
        return ApiResponse.success(res, result, result.message);
      } else {
        return ApiResponse.error(res, 'You are already on this plan', 400);
      }
    } catch (error) {
      logger.error('Change plan error:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // Validate if downgrade is possible
  async validateDowngrade(req, res) {
    try {
      const { planId } = req.params;
      const validation = await subscriptionService.validateDowngrade(req.user.id, planId);

      return ApiResponse.success(res, validation, 'Downgrade validation complete');
    } catch (error) {
      logger.error('Validate downgrade error:', error);
      return ApiResponse.error(res, 'Failed to validate downgrade', 500);
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { immediately } = req.body;
      const result = await subscriptionService.cancel(req.user.id, immediately);

      return ApiResponse.success(res, result, 'Subscription cancelled');
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // Get billing history
  async getBillingHistory(req, res) {
    try {
      const history = await db.BillingHistory.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      return ApiResponse.success(res, history, 'Billing history retrieved');
    } catch (error) {
      logger.error('Get billing history error:', error);
      return ApiResponse.error(res, 'Failed to retrieve billing history', 500);
    }
  }
}

module.exports = new SubscriptionController();
