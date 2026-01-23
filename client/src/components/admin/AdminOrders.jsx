import React from 'react';

export default function AdminOrders({ orders, searchQuery, onSearchChange, filterStatus, onFilterChange, onCancelClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'NEW':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDELIVERED':
        return 'bg-orange-100 text-orange-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by order ID or user..."
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
          <option value="NEW">New</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="UNDELIVERED">Undelivered</option>
        </select>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Restaurant</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{order.orderId || order._id?.slice(-6)}</td>
                <td className="px-4 py-3">{order.user?.name || order.customer?.name}</td>
                <td className="px-4 py-3">{order.restaurant?.name}</td>
                <td className="px-4 py-3">₹{order.pricing?.total || 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => onCancelClick(order._id)}
                      className="text-accent hover:text-red-600 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
