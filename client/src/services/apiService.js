import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User API
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getOrders: () => api.get('/users/orders'),
  getOrderById: (id) => api.get(`/users/orders/${id}`),
};

// Vendor API
export const vendorService = {
  // Restaurant Management
  getRestaurant: () => api.get('/vendors/restaurant'),
  getRestaurants: () => api.get('/vendors/restaurants'),
  createRestaurant: (data) => api.post('/vendors/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/vendors/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/vendors/restaurants/${id}`),
  getStoreStatus: () => api.get('/vendors/store-status'),

  // Menu Management
  getMenu: (restaurantId) => api.get(`/vendors/restaurants/${restaurantId}/menu`),
  addMenuItem: (restaurantId, data) => api.post(`/vendors/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (restaurantId, menuId, data) => api.put(`/vendors/restaurants/${restaurantId}/menu/${menuId}`, data),
  toggleMenuAvailability: (restaurantId, menuId, isAvailable) => 
    api.patch(`/vendors/restaurants/${restaurantId}/menu/${menuId}/availability`, { isAvailable }),
  deleteMenuItem: (restaurantId, menuId) => api.delete(`/vendors/restaurants/${restaurantId}/menu/${menuId}`),

  // Order Management
  getOrders: () => api.get('/vendors/orders'),
  getOrderDetails: (orderId) => api.get(`/vendors/orders/${orderId}`),
  acknowledgeOrder: (orderId) => api.patch(`/vendors/orders/${orderId}/acknowledge`),
  updateOrderStatus: (orderId, status, declineReason) => 
    api.patch(`/vendors/orders/${orderId}/status`, { status, declineReason }),
};

// Admin API
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getVendors: () => api.get('/admin/vendors'),
  suspendVendor: (id) => api.put(`/admin/vendors/${id}/suspend`),
  getOrders: () => api.get('/admin/orders'),
};

// Food API (for customers)
export const foodService = {
  getRestaurants: () => api.get('/foods/restaurants'),
  getRestaurantById: (id) => api.get(`/foods/restaurants/${id}`),
  getFoods: () => api.get('/foods'),
  searchFoods: (query) => api.get(`/foods/search?q=${query}`),
};

// Order API
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getRecentOrders: (limit = 5) => api.get(`/orders/recent?limit=${limit}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
};

// Train API
export const trainService = {
  getTrains: () => api.get('/trains'),
  getTrainById: (id) => api.get(`/trains/${id}`),
  getTrainSchedule: () => api.get('/trains/schedule'),
};

export default api;
