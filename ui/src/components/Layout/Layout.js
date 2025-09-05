import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
      <>
        <Header />
        <main className="dashboard-content">
          <div className="container">
            {children}
          </div>
        </main>
      </>
  );
};

export default Layout;
