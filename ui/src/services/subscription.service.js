import api from './api';

class SubscriptionService {
  async getPlans() {
    const response = await api.get('/subscriptions/plans');
    return response.data.data;
  }

  async getMySubscription() {
    const response = await api.get('/subscriptions/my-subscription');
    return response.data.data;
  }

  async createCheckoutSession(planId) {
    const response = await api.post('/subscriptions/checkout', { planId });
    return response.data.data;
  }

  async changePlan(planId) {
    const response = await api.post('/subscriptions/change-plan', { planId });
    return response.data.data;
  }

  async validateDowngrade(planId) {
    const response = await api.get(`/subscriptions/validate-downgrade/${planId}`);
    return response.data.data;
  }

  async cancelSubscription(immediately = false) {
    const response = await api.post('/subscriptions/cancel', { immediately });
    return response.data.data;
  }

  async getBillingHistory() {
    const response = await api.get('/subscriptions/billing-history');
    return response.data.data;
  }
}

export default new SubscriptionService();
