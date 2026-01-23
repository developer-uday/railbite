import React, { useState } from 'react';
import { adminService } from '../../services/apiService';

export default function AdminManagers({ onOpenModal, managers, setManagers, loading }) {
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (managerId) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;

    try {
      setDeleting(managerId);
      await adminService.deleteManager(managerId);
      setManagers(managers.filter((m) => m._id !== managerId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete manager');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={() => onOpenModal(null)}
        className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
      >
        + Create Manager
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Loading managers...
                </td>
              </tr>
            ) : managers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No managers found
                </td>
              </tr>
            ) : (
              managers.map((manager) => (
                <tr key={manager._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{manager.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{manager.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{manager.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        manager.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {manager.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onOpenModal(manager)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(manager._id)}
                      disabled={deleting === manager._id}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting === manager._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
