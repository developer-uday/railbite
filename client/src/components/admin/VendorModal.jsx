import React from 'react';

export default function VendorModal({ vendor, isOpen, onClose, onSuspend, onActivate, onReject }) {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Vendor Details</h2>
        <p className="mb-2"><strong>Name:</strong> {vendor.name}</p>
        <p className="mb-2"><strong>Email:</strong> {vendor.email}</p>
        <p className="mb-2"><strong>Phone:</strong> {vendor.phone || 'N/A'}</p>
        <p className="mb-4"><strong>Status:</strong> {vendor.isActive ? 'Active' : 'Suspended'}</p>
        <div className="flex gap-2">
          {vendor.isActive ? (
            <button
              onClick={() => onSuspend(vendor._id)}
              className="flex-1 bg-accent hover:bg-red-600 text-white py-2 rounded font-semibold transition"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => onActivate(vendor._id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => onReject(vendor._id)}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2 rounded font-semibold transition"
          >
            Reject
          </button>
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
