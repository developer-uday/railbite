import React from 'react';

export default function AdminRestaurants({ restaurants, searchQuery, onSearchChange, filterStatus, onFilterChange, sortBy, onSortChange, onViewClick, onApprove, onReject, onDelete }) {
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search restaurants..."
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
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
        {restaurants.map((restaurant) => (
          <div key={restaurant._id} className="bg-white border border-gray-300 rounded-lg p-6 shadow hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm">Cuisine: {restaurant.cuisine}</p>
            <p className="text-gray-600 text-sm">Rating: ⭐ {restaurant.rating || 'N/A'}</p>
            <p className="text-gray-600 text-sm">Location: {restaurant.location}</p>
            <p className="text-gray-600 text-sm mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {restaurant.isActive ? 'Approved' : 'Pending'}
              </span>
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onViewClick(restaurant)}
                className="flex-1 bg-primary hover:bg-gray-700 text-white py-2 rounded text-sm font-semibold transition"
              >
                View
              </button>
              {!restaurant.isActive && (
                <>
                  <button
                    onClick={() => onApprove(restaurant._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(restaurant._id)}
                    className="flex-1 bg-accent hover:bg-red-600 text-white py-2 rounded text-sm font-semibold transition"
                  >
                    Reject
                  </button>
                </>
              )}
              {restaurant.isActive && (
                <button
                  onClick={() => onDelete(restaurant._id)}
                  className="flex-1 bg-accent hover:bg-red-600 text-white py-2 rounded text-sm font-semibold transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
