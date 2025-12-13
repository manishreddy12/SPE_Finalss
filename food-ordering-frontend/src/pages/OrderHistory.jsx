import React, { useEffect, useState } from 'react';
import { getOrdersByUser } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const data = await getOrdersByUser(user.id, token);
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="page-title">My Orders</h2>
      {error && <div className="error">{error}</div>}
      {orders.length === 0 && <div>No orders yet.</div>}
      {orders.map((o) => (
        <div key={o.id || o._id} className="card">
          <div className="flex-between">
            <div>
              <div>
                <strong>Order #{o.id || o._id}</strong>
              </div>
              <div className="small">Status: {o.status}</div>
            </div>
            <div>
              <Link to={`/orders/${o.id || o._id}`}>
                <button className="secondary">Track</button>
              </Link>
              <Link to={`/payments/${o.id || o._id}`}>
                <button className="mt-8">Pay</button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
