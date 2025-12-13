import React, { useState } from 'react';
import { getPaymentById, refundPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';

const AdminPayments = () => {
  const { token } = useAuth();
  const [paymentId, setPaymentId] = useState('');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const handleFetchPayment = async () => {
    setError('');
    setMessage('');
    setPayment(null);
    if (!paymentId) return;
    setLoading(true);
    try {
      const data = await getPaymentById(paymentId, token);
      setPayment(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!payment) return;
    setError('');
    setMessage('');
    setRefunding(true);
    try {
      await refundPayment(payment.id || payment._id, token);
      setMessage('Refund requested.');
    } catch (err) {
      console.error(err);
      setError('Refund failed');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Admin: Payments</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <div className="form-row">
          <label className="label">Payment ID</label>
          <input
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="Enter payment ID"
          />
        </div>
        <button onClick={handleFetchPayment} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Payment'}
        </button>
      </div>

      {payment && (
        <div className="card mt-16">
          <div>Payment ID: {payment.id || payment._id}</div>
          <div>Status: {payment.status}</div>
          <button
            className="danger mt-8"
            onClick={handleRefund}
            disabled={refunding}
          >
            {refunding ? 'Processing Refund...' : 'Refund Payment'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
