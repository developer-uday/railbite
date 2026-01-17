import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { vendorService } from '../services/apiService';

export default function VendorSetup() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    description: '',
    distanceFromStation: '',
    minPreparationTime: 20,
    paymentMode: 'COD',
    operatingHours: {
      open: '10:00',
      close: '22:00',
    },
    breakTime: {
      from: '14:00',
      to: '16:00',
    },
  });

  if (!user || user.role !== 'vendor') {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const restaurantData = {
        ...formData,
        distanceFromStation: parseFloat(formData.distanceFromStation),
        minPreparationTime: parseInt(formData.minPreparationTime),
      };

      await vendorService.createRestaurant(restaurantData);
      alert('Restaurant created successfully!');
      navigate('/vendor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-black p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚂 RAILBITE - Vendor Setup</h1>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-accent hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create Your Restaurant</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Restaurant Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Restaurant Description (optional)"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  rows="3"
                />
              </div>
            </div>

            {/* Operational Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Operational Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Distance from Station (km)</label>
                  <input
                    type="number"
                    name="distanceFromStation"
                    placeholder="e.g., 5"
                    value={formData.distanceFromStation}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Min Preparation Time (minutes)</label>
                  <input
                    type="number"
                    name="minPreparationTime"
                    value={formData.minPreparationTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="PREPAID">Prepaid (Razorpay/Paytm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Operating Hours (24-hour format)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Open Time</label>
                  <input
                    type="time"
                    name="operatingHours.open"
                    value={formData.operatingHours.open}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Close Time</label>
                  <input
                    type="time"
                    name="operatingHours.close"
                    value={formData.operatingHours.close}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Break Time */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Break Time (optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Break From</label>
                  <input
                    type="time"
                    name="breakTime.from"
                    value={formData.breakTime.from}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Break To</label>
                  <input
                    type="time"
                    name="breakTime.to"
                    value={formData.breakTime.to}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-gray-700 text-white py-3 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Restaurant'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
