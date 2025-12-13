import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../api/restaurants';
import { createOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState('');
  const [orderingItemId, setOrderingItemId] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(id);
        setRestaurant(data);
        // assume data.menu or data.items
        setMenuItems(data.menu || data.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant');
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleOrderNow = async (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/restaurants/${id}` } } });
      return;
    }

    setError('');
    setOrderingItemId(item.id || item._id);
    try {
      const orderPayload = {
        restaurant_id: restaurant.id || restaurant._id,
        user_id: user.id, // expected by /orders?user_id
        items: [
          {
            item_id: item.id || item._id,
            quantity: 1
          }
        ]
      };
      const order = await createOrder(orderPayload, token);
      const orderId = order.id || order._id;
      navigate(`/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create order');
    } finally {
      setOrderingItemId(null);
    }
  };

  if (!restaurant && !error) {
    return <div>Loading restaurant...</div>;
  }

  return (
    <div>
      <h2 className="page-title">
        {restaurant ? restaurant.name : 'Restaurant Details'}
      </h2>
      {error && <div className="error">{error}</div>}
      {restaurant && (
        <>
          {restaurant.description && (
            <p className="small">{restaurant.description}</p>
          )}
          <h3>Menu</h3>
          {menuItems.length === 0 && <div>No menu items.</div>}
          {menuItems.map((item) => (
            <div key={item.id || item._id} className="card">
              <div className="flex-between">
                <div>
                  <strong>{item.name}</strong>
                  {item.price && (
                    <div className="small">₹ {item.price}</div>
                  )}
                </div>
                <button
                  onClick={() => handleOrderNow(item)}
                  disabled={orderingItemId === (item.id || item._id)}
                >
                  {orderingItemId === (item.id || item._id)
                    ? 'Ordering...'
                    : 'Order Now'}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RestaurantDetails;
