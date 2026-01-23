import React from 'react';

export default function AdminTabs({ activeTab, onTabChange, userRole }) {
  let tabs = ['stats', 'users', 'vendors', 'restaurants', 'orders'];
  
  // Only show managers tab to admin role, not to manager role
  if (userRole === 'admin') {
    tabs.push('managers');
  }

  return (
    <div className="flex gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap ${
            activeTab === tab
              ? 'border-secondary text-secondary'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
