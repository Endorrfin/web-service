const PaymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const logger = require('../../shared/utils/logger');
const { webhooks } = require('stripe');


class PaymentController {
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency, metadata } = req.body;
      const userId = req.user.id;

      const paymentIntent = await PaymentService.createPaymentIntent(
        userId,
        amount,
        currency,
        metadata
      );

      return successResponse(res, 'Payment intent created', {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      logger.error('Payment intent creation error:', error);
      return errorResponse(res, 'Failed to create payment intent', 500);
    }
  }

  async stripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      await PaymentService.handleWebhook(event);
      return res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  async createSubscription(req, res) {
    try {
      const { priceId, paymentMethodId } = req.body;
      const userId = req.user.id;

      const subscription = await PaymentService.createSubscription(
        userId,
        priceId,
        paymentMethodId
      );

      return successResponse(res, 'Subscription created', {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      });

    } catch (error) {
      logger.error('Subscription creation error:', error);
      return errorResponse(res, 'Failed to create subscription', 500);
    }
  }


  async updateSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const { newPriceId } = req.body;

      const subscription = await PaymentService.updateSubscription(
        subscriptionId,
        newPriceId
      );

      return successResponse(res, 'Subscription updated', {
        subscription
      });

    } catch (error) {
      logger.error('Subscription update error:', error);
      return errorResponse(res, 'Failed to update subscription', 500);
    }
  }

}

module.exports = new PaymentController();
