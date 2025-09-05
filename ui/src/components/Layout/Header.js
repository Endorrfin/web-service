import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">QR Service</div>

            <nav className="nav-menu">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/subscription" className="nav-link">Subscription</Link>

              <div className="user-info">
                <div className="user-avatar">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <span>{user?.email}</span>
              </div>

              <button onClick={logout} className="btn btn-primary">
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>
  );
};

export default Header;
