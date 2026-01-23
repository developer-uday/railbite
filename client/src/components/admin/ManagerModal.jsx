import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiService';

export default function ManagerModal({ isOpen, onClose, manager = null, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (manager) {
      setFormData({
        name: manager.name || '',
        email: manager.email || '',
        password: '',
        phone: manager.phone || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
      });
    }
    setError('');
  }, [manager, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Name, email, and phone are required');
        setLoading(false);
        return;
      }

      if (manager && !formData.password) {
        // Updating existing manager - password not required
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };
        const response = await adminService.updateManager(manager._id, updateData);
        onSave(response.data.manager);
      } else if (!manager && !formData.password) {
        // Creating new manager - password required
        setError('Password is required');
        setLoading(false);
        return;
      } else if (!manager) {
        // Creating new manager
        const response = await adminService.createManager(formData);
        onSave(response.data.manager);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save manager');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {manager ? 'Edit Manager' : 'Create New Manager'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          {!manager && (
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
                placeholder="Minimum 6 characters"
              />
            </div>
          )}

          {manager && (
            <div>
              <label className="block text-sm font-semibold mb-1">
                New Password (optional)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Leave empty to keep current password"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : manager ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
