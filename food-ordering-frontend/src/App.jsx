import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetails from './pages/RestaurantDetails';
import OrderHistory from './pages/OrderHistory';
import OrderStatus from './pages/OrderStatus';
import Payment from './pages/Payment';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminOrders from './pages/AdminOrders';
import AdminPayments from './pages/AdminPayments';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/restaurants" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/:orderId"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute adminOnly>
                <AdminRestaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute adminOnly>
                <AdminPayments />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
