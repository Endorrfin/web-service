const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const logger = require('../../shared/utils/logger');


class StripeService {
  // Create a Stripe customer for a user
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id
        }
      });

      logger.info(`Stripe customer created: ${customer.id} for user: ${user.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw error;
    }
  }


  // Create a checkout session for subscription
  async createCheckoutSession(user, priceId, successUrl, cancelUrl) {
    try {
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;

        await user.update({ stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user.id
        },
        subscription_data: {
          metadata: {
            userId: user.id
          }
        }
      });

      return session;
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }


  async createPaymentIntent(amount, customerId, description) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        description
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }


  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      if (immediately) {
        // Cancel immediately
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        return subscription;
      } else {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
        return subscription;
      }
    } catch (error) {
      logger.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, newPriceId, prorationBehavior = 'create_prorations') {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: prorationBehavior
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  async createCreditNote(invoiceId, amount, reason) {
    try {
      const creditNote = await stripe.creditNotes.create({
        invoice: invoiceId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason || 'other',
        memo: 'Subscription downgrade credit'
      });

      return creditNote;
    } catch (error) {
      logger.error('Error creating credit note:', error);
      throw error;
    }
  }

  async getUpcomingInvoice(customerId) {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId
      });
      return invoice;
    } catch (error) {
      logger.error('Error retrieving upcoming invoice:', error);
      throw error;
    }
  }

  async applyCustomerBalance(customerId, amount, description) {
    try {
      const transaction = await stripe.customers.createBalanceTransaction(customerId, {
        amount: -Math.round(amount * 100), // Negative for credit
        currency: 'usd',
        description
      });

      return transaction;
    } catch (error) {
      logger.error('Error applying customer balance:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
