import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API functions will be added during integration
export const experiencesAPI = {
  getAll: (search = '') => api.get(`/experiences?search=${search}`),
  getById: (id) => api.get(`/experiences/${id}`),
  checkAvailability: (id, date, time) => 
    api.get(`/experiences/${id}/availability?date=${date}&time=${time}`),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getByRef: (ref) => api.get(`/bookings/${ref}`),
};

export const paymentsAPI = {
  createOrder: (orderData) => api.post('/payments/create-order', orderData),
  verify: (paymentData) => api.post('/payments/verify', paymentData),
};

export default api;