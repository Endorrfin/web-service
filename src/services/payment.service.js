const stripe = require('stripe') (process.env.STRIPE_SECRET_KEY);
const {Payment, Invoice } = require('../models');
const logger = require('../../shared/utils/logger');


class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  async createPaymentIntent(userId, amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Store payment record
      await Payment.create({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        metadata
      });

      return paymentIntent;
    } catch (error) {
      logger.error('❌ Payment intent creation failed:', error);
      throw error;
    }
  }


  async createSubscription(userId, priceId, paymentMethodId) {
    try {
      const customer = await this.getOrCreateCustomer(userId);

      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      return subscription;
    } catch (error) {
      logger.error('❌ Subscription creation failed:', error);
      throw error;
    }
  }

  // Subscription management with downgrade logic
  async updateSubscription(subscriptionId, newPriceId, prorationBehavior = 'always_invoice') {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: prorationBehavior
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('❌ Subscription update failed:', error);
      throw error;
    }
  }

  async getOrCreateCustomer(userId) {
    try {
      const customers = await this.stripe.customers.list({
        metadata: { userId },
        limit: 1
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      const customer = await this.stripe.customers.create({
        metadata: { userId }
      });

      return customer;
    } catch (error) {
      logger.error('❌ Customer creation/retrieval failed:', error);
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSuccess(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(event.data.object);
        break;

      default:
        logger.warn(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    await Payment.update(
      { status: 'succeeded' },
      { where: { stripe_payment_intent_id: paymentIntent.id } }
    );

    logger.info(`Payment succeeded: ${paymentIntent.id}`);
  }

  async handlePaymentFailure(paymentIntent) {
    await Payment.update(
      { status: 'failed' },
      { where: { stripe_payment_intent_id: paymentIntent.id } }
    );

    logger.error(`Payment failed: ${paymentIntent.id}`);
  }

}

module.exports = new PaymentService();
