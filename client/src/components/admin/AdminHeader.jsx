import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ user, onLogout }) {
  return (
    <header className="bg-primary text-black p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚂 RAILBITE - Admin Panel</h1>
        <div className="flex gap-4 items-center">
          <Link to="/orders" className="text-sm font-semibold hover:underline">
            Orders Management
          </Link>
          <span className="text-sm">{user?.email}</span>
          <button
            onClick={onLogout}
            className="bg-accent hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
