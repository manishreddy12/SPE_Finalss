import axios from 'axios';

const ORDER_BASE_URL =
  import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:3002';

export const createOrder = async (orderData, token) => {
  const res = await axios.post(`${ORDER_BASE_URL}/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const getOrderById = async (id, token) => {
  const res = await axios.get(`${ORDER_BASE_URL}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const getOrdersByUser = async (userId, token) => {
  const res = await axios.get(
    `${ORDER_BASE_URL}/orders?user_id=${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
};

export const updateOrderStatus = async (id, status, token) => {
  const res = await axios.put(
    `${ORDER_BASE_URL}/orders/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
};
