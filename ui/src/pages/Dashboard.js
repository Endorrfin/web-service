import React from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
      <Layout>
        <h1>Welcome, {user?.firstName}!</h1>
        <p>Role: {user?.role}</p>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>QR Codes</h3>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <h3>Total Scans</h3>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <h3>Active Pages</h3>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <h3>Current Plan</h3>
            <div className="stat-value">Free</div>
          </div>
        </div>
      </Layout>
  );
};

export default Dashboard;
