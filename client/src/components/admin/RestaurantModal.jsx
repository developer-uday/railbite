import React from 'react';

export default function RestaurantModal({ restaurant, isOpen, onClose }) {
  if (!isOpen || !restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Restaurant Details</h2>
        <p className="mb-2"><strong>Name:</strong> {restaurant.name}</p>
        <p className="mb-2"><strong>Cuisine:</strong> {restaurant.cuisine}</p>
        <p className="mb-2"><strong>Rating:</strong> ⭐ {restaurant.rating || 'N/A'}</p>
        <p className="mb-2"><strong>Location:</strong> {restaurant.location}</p>
        <p className="mb-4"><strong>Status:</strong> {restaurant.isActive ? 'Approved' : 'Pending'}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
