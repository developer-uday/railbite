import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/apiService';

export default function OrdersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrders();
      setOrders(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      loadOrders();
    }
  }, [user, navigate, loadOrders]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o._id?.includes(searchQuery) ||
        o.orderId?.toString().includes(searchQuery) ||
        o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.orderStatus === filterStatus);
    }
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'UNDELIVERED':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-black p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚂 RAILBITE - Orders Management</h1>
          <div className="flex gap-4 items-center">
            <Link to="/admin" className="text-sm font-semibold hover:underline">
              Back to Admin
            </Link>
            <span className="text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold">×</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {!loading && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Search by order ID or user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="UNDELIVERED">Undelivered</option>
              </select>
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-primary hover:bg-gray-700 text-white rounded font-semibold transition"
              >
                Refresh
              </button>
            </div>

            {/* Summary */}
            <div className="mb-4 text-sm text-gray-600">
              Showing <strong>{getFilteredOrders().length}</strong> of <strong>{orders.length}</strong> orders
            </div>

            {/* Orders Table */}
            {getFilteredOrders().length > 0 ? (
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Order ID</th>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Station</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map((order) => (
                      <tr key={order._id} className="border-t border-gray-300 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm font-semibold">
                          {order.orderId || order._id?.slice(-6)}
                        </td>
                        <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{order.journey?.station || 'N/A'}</td>
                        <td className="px-4 py-3 font-semibold">₹{order.pricing?.total || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <a
                            href={`/orders/${order.orderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:text-yellow-500 font-semibold text-sm underline"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-gray-300 rounded-lg">
                <p className="text-gray-600 text-lg">No orders found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
