import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');

  const loadAdminData = useCallback(async () => {
    try {
      // TODO: Fetch admin data from API
      setStats({
        totalUsers: 150,
        totalVendors: 25,
        totalOrders: 500,
        revenue: 125000,
      });
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 8 },
      ]);
      setVendors([
        { id: 1, name: 'Pizza Palace', rating: 4.5, orders: 50 },
        { id: 2, name: 'Tandoori Express', rating: 4.8, orders: 75 },
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAdminData();
    }
  }, [user, navigate, loadAdminData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-black p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚂 RAILBITE - Admin Panel</h1>
          <div className="flex gap-4 items-center">
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
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeTab === 'stats'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeTab === 'users'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 font-semibold border-b-2 ${
              activeTab === 'vendors'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Vendors
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Vendors</h3>
              <p className="text-3xl font-bold text-primary">{stats.totalVendors}</p>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Orders</h3>
              <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Revenue</h3>
              <p className="text-3xl font-bold text-secondary">₹{stats.revenue}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Orders</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr key={usr.id} className="border-t border-gray-300 hover:bg-gray-50">
                    <td className="px-4 py-3">{usr.name}</td>
                    <td className="px-4 py-3">{usr.email}</td>
                    <td className="px-4 py-3">{usr.orders}</td>
                    <td className="px-4 py-3">
                      <button className="text-secondary hover:text-yellow-500 font-semibold text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-2 gap-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="font-bold text-lg">{vendor.name}</h3>
                <p className="text-gray-600">Rating: ⭐ {vendor.rating}</p>
                <p className="text-gray-600">Orders: {vendor.orders}</p>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-primary hover:bg-gray-700 text-white py-2 rounded text-sm font-semibold">
                    View
                  </button>
                  <button className="flex-1 bg-accent hover:bg-red-600 text-white py-2 rounded text-sm font-semibold">
                    Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
