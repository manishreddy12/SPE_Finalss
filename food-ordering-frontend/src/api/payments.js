import axios from 'axios';

const PAYMENT_BASE_URL =
  import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3003';

export const createPayment = async (paymentData, token) => {
  const idempotencyKey =
    paymentData.idempotencyKey ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const res = await axios.post(`${PAYMENT_BASE_URL}/payments`, paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey
    }
  });
  return res.data;
};

export const getPaymentById = async (id, token) => {
  const res = await axios.get(`${PAYMENT_BASE_URL}/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const refundPayment = async (id, token) => {
  const res = await axios.post(
    `${PAYMENT_BASE_URL}/payments/${id}/refund`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res.data;
};
