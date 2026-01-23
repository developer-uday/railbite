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
  declineOrder: (orderId, declineReason) => api.patch(`/vendors/orders/${orderId}/decline`, { declineReason }),
  updateOrderStatus: (orderId, status, declineReason) => 
    api.patch(`/vendors/orders/${orderId}/status`, { status, declineReason }),
};

// Admin API
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getVendors: () => api.get('/admin/vendors'),
  getRestaurants: () => api.get('/admin/restaurants'),
  getOrders: () => api.get('/admin/orders'),
  
  // User Management
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Vendor Management
  suspendVendor: (vendorId) => api.put(`/admin/vendors/${vendorId}/suspend`),
  approveVendor: (vendorId) => api.put(`/admin/vendors/${vendorId}/approve`),
  rejectVendor: (vendorId) => api.put(`/admin/vendors/${vendorId}/reject`),
  deleteVendor: (vendorId) => api.delete(`/admin/vendors/${vendorId}`),
  
  // Restaurant Management
  approveRestaurant: (restaurantId) => api.put(`/admin/restaurants/${restaurantId}/approve`),
  rejectRestaurant: (restaurantId) => api.put(`/admin/restaurants/${restaurantId}/reject`),
  deleteRestaurant: (restaurantId) => api.delete(`/admin/restaurants/${restaurantId}`),
  
  // Order Management
  cancelOrder: (orderId) => api.put(`/admin/orders/${orderId}/cancel`),
  updateOrder: (orderId, data) => api.put(`/admin/orders/${orderId}`, data),
  
  // Manager Management
  createManager: (data) => api.post(`/admin/managers`, data),
  getManagers: () => api.get(`/admin/managers`),
  getManager: (managerId) => api.get(`/admin/managers/${managerId}`),
  updateManager: (managerId, data) => api.put(`/admin/managers/${managerId}`, data),
  deleteManager: (managerId) => api.delete(`/admin/managers/${managerId}`),
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
