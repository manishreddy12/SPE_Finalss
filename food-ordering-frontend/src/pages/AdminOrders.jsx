import React, { useEffect, useState } from 'react';
import { getOrdersByUser, getOrderById, updateOrderStatus } from '../api/orders';
import { useAuth } from '../context/AuthContext';

/**
 * Simple admin UI:
 * - Input to fetch single order by ID
 * - Change order status via PUT /orders/:id/status
 */
const AdminOrders = () => {
  const { token } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFetchOrder = async () => {
    setError('');
    setOrder(null);
    if (!searchId) return;
    try {
      const o = await getOrderById(searchId, token);
      setOrder(o);
      setStatus(o.status || '');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order');
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    setError('');
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order.id || order._id, status, token);
      setOrder(updated);
    } catch (err) {
      console.error(err);
      setError('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin: Orders</h2>
      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="form-row">
          <label className="label">Order ID</label>
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter order ID"
          />
        </div>
        <button onClick={handleFetchOrder}>Fetch Order</button>
      </div>

      {order && (
        <div className="card mt-16">
          <div>Order ID: {order.id || order._id}</div>
          <div className="small">Current Status: {order.status}</div>
          <div className="form-row mt-8">
            <label className="label">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="preparing">preparing</option>
              <option value="ready">ready</option>
              <option value="delivered">delivered</option>
              <option value="completed">completed</option>
            </select>
          </div>
          <button onClick={handleUpdateStatus} disabled={saving || !status}>
            {saving ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
