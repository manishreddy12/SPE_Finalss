import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  return (
    <div className="navbar">
      <div>
        <Link to="/" className="nav-link">
          Food Ordering
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/restaurants" className="nav-link">
          Restaurants
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/orders" className="nav-link">
              My Orders
            </Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link to="/admin/restaurants" className="nav-link">
              Admin Restaurants
            </Link>
            <Link to="/admin/orders" className="nav-link">
              Admin Orders
            </Link>
            <Link to="/admin/payments" className="nav-link">
              Admin Payments
            </Link>
          </>
        )}
        {!isAuthenticated ? (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        ) : (
          <>
            <span className="small">
              {user?.username} {isAdmin ? '(Admin)' : ''}
            </span>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
