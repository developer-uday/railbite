import React from 'react';

export default function RecentOrders({ orders }) {
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
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Restaurant</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.slice(0, 5).map((order) => (
              <tr key={order._id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="px-4 py-2">{order.orderId || order._id?.slice(-6)}</td>
                <td className="px-4 py-2">{order.user?.name || order.customer?.name}</td>
                <td className="px-4 py-2">{order.restaurant?.name}</td>
                <td className="px-4 py-2">₹{order.pricing?.total || order.totalPrice}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
