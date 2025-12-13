import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 3000;

const OrderStatus = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let interval;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id, token);
        setOrder(data);
        if (
          data.status === 'completed' ||
          data.status === 'cancelled' ||
          data.status === 'delivered'
        ) {
          setPolling(false);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch order');
        setPolling(false);
      }
    };

    fetchOrder();

    if (polling) {
      interval = setInterval(fetchOrder, POLL_INTERVAL_MS);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, token, polling]);

  return (
    <div>
      <h2 className="page-title">Order Status</h2>
      {error && <div className="error">{error}</div>}
      {!order && !error && <div>Loading order...</div>}
      {order && (
        <>
          <div className="card">
            <div>Order ID: {order.id || order._id}</div>
            <div>Status: {order.status}</div>
          </div>
          <p className="small">
            Pending → confirmed → preparing → ready → delivered → completed
          </p>
          <Link to={`/payments/${order.id || order._id}`}>
            <button>Proceed to Payment</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default OrderStatus;
