import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout/Layout';
import subscriptionService from '../services/subscription.service';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription()
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSelectPlan = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      if (!currentSubscription?.subscription) {
        // New subscription - redirect to Stripe checkout
        const { checkoutUrl } = await subscriptionService.createCheckoutSession(plan.id);
        window.location.href = checkoutUrl;
      } else {
        // Plan change
        const currentPlanPrice = currentSubscription.subscription.plan.price;
        const newPlanPrice = plan.price;

        if (newPlanPrice > currentPlanPrice) {
          // Upgrade - process
          await subscriptionService.changePlan(plan.id);
          toast.success(`Successfully upgraded to ${plan.name} plan!`);
          navigate('/subscription');
        } else {
          // Downgrade - show validation
          const validation = await subscriptionService.validateDowngrade(plan.id);

          if (validation.canDowngrade) {
            // Show confirmation dialog
            if (window.confirm(
                `Are you sure you want to downgrade to ${plan.name}?\n\n` +
                `Current usage: ${validation.currentUsage}/${validation.planLimit} QR codes\n` +
                `The change will take effect at the end of your current billing period.`
            )) {
              const result = await subscriptionService.changePlan(plan.id);
              toast.success(result.message || `Downgrade to ${plan.name} scheduled`);
              navigate('/subscription');
            }
          } else {
            toast.error(validation.reason);
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process plan selection');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const getPlanButtonText = (plan) => {
    if (loading && selectedPlan === plan.id) return 'Processing...';

    if (currentSubscription?.subscription) {
      if (currentSubscription.subscription.planId === plan.id) {
        return 'Current Plan';
      }
      const currentPrice = currentSubscription.subscription.plan.price;
      if (plan.price > currentPrice) return 'Upgrade';
      if (plan.price < currentPrice) return 'Downgrade';
    }

    return 'Get Started';
  };

  const isPlanDisabled = (plan) => {
    return loading || (currentSubscription?.subscription?.planId === plan.id);
  };

  return (
      <Layout>
        <div className="pricing-container">
          <div className="pricing-header">
            <h1>Choose Your Plan</h1>
            <p>Select the perfect plan for your QR code needs</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
                <div key={plan.id} className={`pricing-card ${currentSubscription?.subscription?.planId === plan.id ? 'current' : ''}`}>
                  {currentSubscription?.subscription?.planId === plan.id && (
                      <div className="current-badge">Current Plan</div>
                  )}

                  <h2 className="plan-name">{plan.name}</h2>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{Math.floor(plan.price)}</span>
                    <span className="period">/{plan.interval}</span>
                  </div>

                  <ul className="plan-features">
                    {plan.features && (
                        Array.isArray(plan.features)
                            ? plan.features
                            : typeof plan.features === 'string'
                                ? JSON.parse(plan.features)
                                : []
                    ).map((feature, index) => (
                        <li key={index}>
                          <span className="checkmark">✓</span>
                          {feature}
                        </li>
                    ))}
                  </ul>

                  <div className="plan-usage">
                    <div className="usage-bar">
                      <div className="usage-label">QR Code Limit</div>
                      <div className="usage-value">{plan.qrCodeLimit} codes</div>
                    </div>
                  </div>

                  <button
                      className={`btn btn-primary ${isPlanDisabled(plan) ? 'disabled' : ''}`}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isPlanDisabled(plan)}
                  >
                    {getPlanButtonText(plan)}
                  </button>
                </div>
            ))}
          </div>

          {currentSubscription?.usage && (
              <div className="current-usage-summary">
                <h3>Your Current Usage</h3>
                <div className="usage-stats">
                  <div className="usage-stat">
                    <span className="stat-label">QR Codes:</span>
                    <span className="stat-value">
                  {currentSubscription.usage.qrCodes.used} / {currentSubscription.usage.qrCodes.limit}
                </span>
                    <div className="progress-bar">
                      <div
                          className="progress-fill"
                          style={{ width: `${currentSubscription.usage.qrCodes.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="usage-stat">
                    <span className="stat-label">Total Scans:</span>
                    <span className="stat-value">{currentSubscription.usage.totalScans}</span>
                  </div>
                  <div className="usage-stat">
                    <span className="stat-label">Active Pages:</span>
                    <span className="stat-value">{currentSubscription.usage.webPages}</span>
                  </div>
                </div>
              </div>
          )}
        </div>
      </Layout>
  );
};

export default Pricing;
