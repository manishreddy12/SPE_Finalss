import axios from 'axios';

const REST_BASE_URL =
  import.meta.env.VITE_RESTAURANT_SERVICE_URL || 'http://localhost:3001';

export const getRestaurants = async () => {
  const res = await axios.get(`${REST_BASE_URL}/restaurants`);
  return res.data;
};

export const getRestaurantById = async (id) => {
  const res = await axios.get(`${REST_BASE_URL}/restaurants/${id}`);
  return res.data;
};

export const createRestaurant = async (data, token) => {
  const res = await axios.post(`${REST_BASE_URL}/restaurants`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const updateRestaurant = async (id, data, token) => {
  const res = await axios.put(`${REST_BASE_URL}/restaurants/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
