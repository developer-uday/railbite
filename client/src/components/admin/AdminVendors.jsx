import React from 'react';

export default function AdminVendors({ vendors, searchQuery, onSearchChange, filterStatus, onFilterChange, sortBy, onSortChange, onViewClick, onActionClick }) {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Suspended</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => (
          <div key={vendor._id} className="bg-white border border-gray-300 rounded-lg p-6 shadow hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">{vendor.name}</h3>
            <p className="text-gray-600 text-sm">Email: {vendor.email}</p>
            <p className="text-gray-600 text-sm">Phone: {vendor.phone || 'N/A'}</p>
            <p className="text-gray-600 text-sm mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {vendor.isActive ? 'Active' : 'Suspended'}
              </span>
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onViewClick(vendor)}
                className="flex-1 bg-primary hover:bg-gray-700 text-white py-2 rounded text-sm font-semibold transition"
              >
                View Details
              </button>
              <button
                onClick={() => onActionClick(vendor._id)}
                className="flex-1 bg-accent hover:bg-red-600 text-white py-2 rounded text-sm font-semibold transition"
              >
                {vendor.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
