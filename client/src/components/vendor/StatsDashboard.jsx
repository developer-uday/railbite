export default function StatsDashboard({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500 shadow-md">
        <p className="text-gray-600 text-xs font-semibold">NEW ORDERS</p>
        <p className="text-3xl font-bold text-yellow-600">{stats.newOrders}</p>
        <p className="text-xs text-gray-500 mt-1">Pending</p>
      </div>
      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-md">
        <p className="text-gray-600 text-xs font-semibold">TOTAL ORDERS</p>
        <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        <p className="text-xs text-gray-500 mt-1">All time</p>
      </div>
      <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-md">
        <p className="text-gray-600 text-xs font-semibold">DELIVERED</p>
        <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
        <p className="text-xs text-gray-500 mt-1">Completed</p>
      </div>
      <div className="bg-white rounded-lg p-4 border-l-4 border-secondary shadow-md">
        <p className="text-gray-600 text-xs font-semibold">REVENUE</p>
        <p className="text-2xl font-bold text-secondary">₹{stats.totalRevenue}</p>
        <p className="text-xs text-gray-500 mt-1">Total</p>
      </div>
      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-md">
        <p className="text-gray-600 text-xs font-semibold">MENU ITEMS</p>
        <p className="text-3xl font-bold text-purple-600">
          {stats.activeItems}/{stats.totalItems}
        </p>
        <p className="text-xs text-gray-500 mt-1">Active</p>
      </div>
    </div>
  );
}
