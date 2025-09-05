import React from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
      <Layout>
        <h1>Profile Settings</h1>
        <div className="auth-card" style={{ maxWidth: '600px', marginTop: '30px' }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" value={user?.firstName || ''} disabled />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" value={user?.lastName || ''} disabled />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" value={user?.role || ''} disabled />
          </div>
          <div className="form-group">
            <label>Account Status</label>
            <input type="text" value={user?.isActive ? 'Active' : 'Inactive'} disabled />
          </div>
        </div>
      </Layout>
  );
};

export default Profile;
