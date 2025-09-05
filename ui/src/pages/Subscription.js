import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import subscriptionService from '../services/subscription.service';
import toast from 'react-hot-toast';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subData, historyData] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getBillingHistory()
      ]);

      setSubscription(subData);
      setBillingHistory(historyData);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await subscriptionService.cancelSubscription(false);
      toast.success('Your subscription will be cancelled at the end of the billing period');
      fetchSubscriptionData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return num < 0 ? `-$${Math.abs(num).toFixed(2)}` : `$${num.toFixed(2)}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending_cancellation': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return (
        <Layout>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </Layout>
    );
  }

  if (!subscription?.subscription) {
    return (
        <Layout>
          <div className="subscription-empty">
            <h2>No Active Subscription</h2>
            <p>Choose a plan to get started with our service</p>
            <Link to="/pricing" className="btn btn-primary">View Plans</Link>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="subscription-container">
          <h1>Subscription Management</h1>

          {/* Current Plan */}
          <div className="subscription-card">
            <div className="card-header">
              <h2>Current Plan</h2>
              <span className={`status-badge ${getStatusBadgeClass(subscription.subscription.status)}`}>
              {subscription.subscription.status.replace('_', ' ')}
            </span>
            </div>

            <div className="plan-details">
              <div className="detail-row">
                <span className="label">Plan:</span>
                <span className="value">{subscription.subscription.plan.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price:</span>
                <span className="value">${subscription.subscription.plan.price}/{subscription.subscription.plan.interval}</span>
              </div>
              <div className="detail-row">
                <span className="label">Current Period:</span>
                <span className="value">
                {formatDate(subscription.subscription.currentPeriodStart)} - {formatDate(subscription.subscription.currentPeriodEnd)}
              </span>
              </div>
              {subscription.subscription.pendingPlanId && (
                  <div className="detail-row pending-change">
                    <span className="label">Pending Change:</span>
                    <span className="value">
                  Downgrade scheduled for {formatDate(subscription.subscription.pendingChangeDate)}
                </span>
                  </div>
              )}
            </div>

            <div className="plan-actions">
              <Link to="/pricing" className="btn btn-secondary">Change Plan</Link>
              {subscription.subscription.status === 'active' && (
                  <button onClick={handleCancelSubscription} className="btn btn-danger">
                    Cancel Subscription
                  </button>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="usage-card">
            <h2>Usage Statistics</h2>

            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-header">
                  <span>QR Codes</span>
                  <span>{subscription.usage.qrCodes.used}/{subscription.usage.qrCodes.limit}</span>
                </div>
                <div className="progress-bar">
                  <div
                      className="progress-fill"
                      style={{
                        width: `${subscription.usage.qrCodes.percentage}%`,
                        backgroundColor: subscription.usage.qrCodes.percentage > 80 ? '#f44336' : '#4caf50'
                      }}
                  />
                </div>
              </div>

              <div className="usage-item">
                <span className="usage-label">Total Scans</span>
                <span className="usage-value">{subscription.usage.totalScans}</span>
              </div>

              <div className="usage-item">
                <span className="usage-label">Active Web Pages</span>
                <span className="usage-value">{subscription.usage.webPages}</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          {subscription.credits && subscription.credits.available > 0 && (
              <div className="credits-card">
                <h2>Available Credits</h2>
                <div className="credits-amount">${subscription.credits.available.toFixed(2)}</div>
                <p className="credits-note">Credits will be applied to your next invoice</p>
              </div>
          )}

          {/* Billing History */}
          <div className="billing-history-card">
            <h2>Billing History</h2>

            <div className="billing-table">
              <table>
                <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
                </thead>
                <tbody>
                {billingHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>{item.description}</td>
                      <td className={parseFloat(item.amount) < 0 ? 'credit' : ''}>
                        {formatAmount(item.amount)}
                      </td>
                      <td>
                      <span className={`type-badge ${item.type}`}>
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      </td>
                    </tr>
                ))}
                {billingHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-state">No billing history yet</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default Subscription;
