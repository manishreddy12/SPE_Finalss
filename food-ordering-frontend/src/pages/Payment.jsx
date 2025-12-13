import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPayment, getPaymentById } from '../api/payments';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const { orderId } = useParams();
  const { token, user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPaymentStatus = async (paymentId) => {
    try {
      const data = await getPaymentById(paymentId, token);
      setPayment(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch payment status');
    }
  };

  const handlePay = async () => {
    setError('');
    setMessage('');
    setProcessing(true);
    try {
      const paymentData = {
        order_id: orderId,
        user_id: user.id,
        amount: 0 // or derive from order; placeholder
      };
      const data = await createPayment(paymentData, token);
      setPayment(data);
      if (data.id || data._id) {
        await fetchPaymentStatus(data.id || data._id);
      }
      setMessage('Payment initiated.');
    } catch (err) {
      console.error(err);
      setError('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Payment</h2>
      <div className="card">
        <div>Order ID: {orderId}</div>
        {payment && (
          <>
            <div>Payment ID: {payment.id || payment._id}</div>
            <div>Status: {payment.status}</div>
            <p className="small">
              Pending → processing → processed → settled → completed
            </p>
          </>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <button onClick={handlePay} disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
      {payment && (
        <button
          className="secondary mt-8"
          onClick={() => fetchPaymentStatus(payment.id || payment._id)}
        >
          Refresh Status
        </button>
      )}
    </div>
  );
};

export default Payment;
