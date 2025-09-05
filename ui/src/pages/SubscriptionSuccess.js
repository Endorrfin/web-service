import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      toast.success('Subscription activated successfully!');
      setTimeout(() => {
        navigate('/subscription');
      }, 2000);
    } else {
      navigate('/pricing');
    }
  }, [navigate, searchParams]);

  return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your subscription has been activated. Redirecting to your dashboard...</p>
        </div>
      </div>
  );
};

export default SubscriptionSuccess;
