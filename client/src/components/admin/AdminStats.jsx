import React from 'react';

export default function AdminStats({ stats }) {
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-primary' },
    { label: 'Total Vendors', value: stats.totalVendors, color: 'text-primary' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'text-primary' },
    { label: 'Restaurants', value: stats.totalRestaurants, color: 'text-primary' },
    { label: 'Total Revenue', value: `₹${stats.revenue?.toLocaleString()}`, color: 'text-secondary' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((card, idx) => (
        <div key={idx} className="bg-white border border-gray-300 rounded-lg p-6 shadow hover:shadow-lg transition">
          <h3 className="text-gray-600 text-sm font-semibold">{card.label}</h3>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
