import React from 'react';

export default function AlertBox({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
      <button onClick={onClose} className="ml-2 font-bold">×</button>
    </div>
  );
}
