const db = require('../models');
const stripeService = require('./stripe.service');
const logger = require('../../shared/utils/logger');
const { Op } = require('sequelize');


class SubscriptionService {
  // Calculate proration for plan changes
  calculateProration(currentPlan, newPlan, daysRemaining, totalDays) {
    const currentDailyRate = currentPlan.price / totalDays;
    const newDailyRate = newPlan.price / totalDays;
    const credit = (currentDailyRate - newDailyRate) * daysRemaining;

    return {
      currentDailyRate,
      newDailyRate,
      daysRemaining,
      credit: Math.max(0, credit),
      charge: Math.max(0, -credit)
    };
  }

  async validateDowngrade(userId, targetPlanId) {
    const targetPlan = await db.Plan.findByPk(targetPlanId);
    if (!targetPlan) {
      throw new Error('Target plan not found');
    }

    const qrCodeCount = await db.QRCode.count({
      where: {
        userId,
        isActive: true
      }
    });

    if (qrCodeCount > targetPlan.qrCodeLimit) {
      return {
        canDowngrade: false,
        reason: `You have ${qrCodeCount} active QR codes. The ${targetPlan.name} plan allows only ${targetPlan.qrCodeLimit}. Please deactivate ${qrCodeCount - targetPlan.qrCodeLimit} QR codes before downgrading.`,
        currentUsage: qrCodeCount,
        planLimit: targetPlan.qrCodeLimit
      };
    }

    return {
      canDowngrade: true,
      currentUsage: qrCodeCount,
      planLimit: targetPlan.qrCodeLimit
    };
  }

  async subscribe(userId, planId, stripeSubscriptionId) {
    const user = await db.User.findByPk(userId);
    const plan = await db.Plan.findByPk(planId);

    if (!user || !plan) {
      throw new Error('User or plan not found');
    }

    const existingSubscription = await db.Subscription.findOne({
      where: { userId, status: 'active' }
    });

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    const stripeSubscription = await stripeService.getSubscription(stripeSubscriptionId);

    const subscription = await db.Subscription.create({
      userId,
      planId,
      status: 'active',
      stripeSubscriptionId,
      stripeCustomerId: stripeSubscription.customer,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });

    // Record billing history
    await db.BillingHistory.create({
      userId,
      subscriptionId: subscription.id,
      type: 'subscription_created',
      amount: plan.price,
      description: `Subscribed to ${plan.name} plan`,
      stripeInvoiceId: stripeSubscription.latest_invoice
    });

    logger.info(`User ${userId} subscribed to plan ${planId}`);
    return subscription;
  }

  // Upgrade subscription
  async upgrade(userId, newPlanId) {
    const subscription = await db.Subscription.findOne({
      where: { userId, status: 'active' },
      include: [{ model: db.Plan, as: 'plan' }]
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const newPlan = await db.Plan.findByPk(newPlanId);
    if (!newPlan) {
      throw new Error('New plan not found');
    }

    if (newPlan.price <= subscription.plan.price) {
      throw new Error('New plan must be more expensive than current plan for upgrade');
    }

    // Update subscription in Stripe
    const updatedStripeSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      newPlan.stripePriceId,
      'create_prorations'
    );

    // Update local subscription
    await subscription.update({
      planId: newPlanId,
      currentPeriodStart: new Date(updatedStripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(updatedStripeSubscription.current_period_end * 1000)
    });

    // Record billing history
    await db.BillingHistory.create({
      userId,
      subscriptionId: subscription.id,
      type: 'plan_upgraded',
      amount: newPlan.price - subscription.plan.price,
      description: `Upgraded from ${subscription.plan.name} to ${newPlan.name}`,
      metadata: {
        oldPlanId: subscription.plan.id,
        newPlanId: newPlan.id
      }
    });

    logger.info(`User ${userId} upgraded from ${subscription.plan.name} to ${newPlan.name}`);
    return subscription;
  }

  // Downgrade subscription with proration and usage validation
  async downgrade(userId, newPlanId) {
    const subscription = await db.Subscription.findOne({
      where: { userId, status: 'active' },
      include: [{ model: db.Plan, as: 'plan' }]
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const newPlan = await db.Plan.findByPk(newPlanId);
    if (!newPlan) {
      throw new Error('New plan not found');
    }

    if (newPlan.price >= subscription.plan.price) {
      throw new Error('New plan must be less expensive than current plan for downgrade');
    }

    // Validate usage before downgrade
    const validation = await this.validateDowngrade(userId, newPlanId);
    if (!validation.canDowngrade) {
      throw new Error(validation.reason);
    }

    // Calculate proration
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const periodStart = new Date(subscription.currentPeriodStart);
    const totalDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

    const proration = this.calculateProration(
      subscription.plan,
      newPlan,
      daysRemaining,
      totalDays
    );

    const updatedStripeSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      newPlan.stripePriceId,
      'none' // No immediate proration, handle manually
    );

    if (proration.credit > 0) {
      await stripeService.applyCustomerBalance(
        subscription.stripeCustomerId,
        proration.credit,
        `Credit for downgrade from ${subscription.plan.name} to ${newPlan.name}`
      );

      await db.Credit.create({
        userId,
        amount: proration.credit,
        type: 'downgrade_proration',
        description: `Credit from downgrade: ${subscription.plan.name} to ${newPlan.name}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
      });
    }

    await subscription.update({
      planId: newPlanId,
      pendingPlanId: newPlanId,
      pendingChangeDate: periodEnd
    });

    // Record billing history
    await db.BillingHistory.create({
      userId,
      subscriptionId: subscription.id,
      type: 'plan_downgraded',
      amount: -proration.credit,
      description: `Downgraded from ${subscription.plan.name} to ${newPlan.name}`,
      metadata: {
        oldPlanId: subscription.plan.id,
        newPlanId: newPlan.id,
        proration: proration,
        effectiveDate: periodEnd
      }
    });

    logger.info(`User ${userId} downgraded from ${subscription.plan.name} to ${newPlan.name}`);

    return {
      subscription,
      proration,
      effectiveDate: periodEnd,
      message: `Your plan will be downgraded to ${newPlan.name} at the end of your current billing period. Credit of $${proration.credit.toFixed(2)} has been applied to your account.`
    };
  }


  // Cancel subscription
  async cancel(userId, immediately = false) {
    const subscription = await db.Subscription.findOne({
      where: { userId, status: 'active' }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Cancel in Stripe
    await stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediately);

    // Update local subscription
    await subscription.update({
      status: immediately ? 'cancelled' : 'pending_cancellation',
      cancelledAt: new Date()
    });

    // Record billing history
    await db.BillingHistory.create({
      userId,
      subscriptionId: subscription.id,
      type: 'subscription_cancelled',
      amount: 0,
      description: immediately ? 'Subscription cancelled immediately' : 'Subscription set to cancel at period end'
    });

    logger.info(`User ${userId} cancelled subscription`);
    return subscription;
  }

  // Get subscription details with usage
  async getSubscriptionDetails(userId) {
    const subscription = await db.Subscription.findOne({
      where: { userId, status: { [Op.in]: ['active', 'pending_cancellation'] } },
      include: [{ model: db.Plan, as: 'plan' }]
    });

    if (!subscription) {
      return null;
    }

    // Get statistics
    const qrCodeCount = await db.QRCode.count({
      where: { userId, isActive: true }
    });

    const totalScans = await db.QRCodeScan.count({
      include: [{
        model: db.QRCode,
        where: { userId }
      }]
    });

    const webPageCount = await db.WebPage.count({
      where: { userId, isPublished: true }
    });

    // Get available credits
    const credits = await db.Credit.findAll({
      where: {
        userId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);

    return {
      subscription,
      usage: {
        qrCodes: {
          used: qrCodeCount,
          limit: subscription.plan.qrCodeLimit,
          percentage: (qrCodeCount / subscription.plan.qrCodeLimit) * 100
        },
        totalScans,
        webPages: webPageCount
      },
      credits: {
        available: totalCredits,
        history: credits
      }
    };
  }
}


module.exports = new SubscriptionService();
