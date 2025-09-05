const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const subscriptionService = require('../services/subscription.service');
const logger = require('../../shared/utils/logger');

class WebhookController {
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  async handleCheckoutComplete(session) {
    const userId = session.metadata.userId;
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    const plan = await db.Plan.findOne({
      where: { stripePriceId: subscription.items.data[0].price.id }
    });

    if (plan) {
      await subscriptionService.subscribe(userId, plan.id, subscription.id);
    }
  }

  async handleSubscriptionUpdate(stripeSubscription) {
    const subscription = await db.Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await subscription.update({
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      });

      if (subscription.pendingPlanId && subscription.pendingChangeDate <= new Date()) {
        await subscription.update({
          planId: subscription.pendingPlanId,
          pendingPlanId: null,
          pendingChangeDate: null
        });
      }
    }
  }

  async handleSubscriptionDeleted(stripeSubscription) {
    const subscription = await db.Subscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await subscription.update({ status: 'cancelled' });
    }
  }

  async handlePaymentSucceeded(invoice) {
    const userId = invoice.metadata?.userId;
    if (userId) {
      await db.BillingHistory.create({
        userId,
        type: 'payment_succeeded',
        amount: invoice.amount_paid / 100,
        description: `Payment for ${invoice.lines.data[0].description}`,
        stripeInvoiceId: invoice.id
      });
    }
  }

  async handlePaymentFailed(invoice) {
    const userId = invoice.metadata?.userId;
    if (userId) {
      await db.BillingHistory.create({
        userId,
        type: 'payment_failed',
        amount: invoice.amount_due / 100,
        description: `Failed payment for ${invoice.lines.data[0].description}`,
        stripeInvoiceId: invoice.id
      });
    }
  }
}

module.exports = new WebhookController();
