import OrderCard from "./OrderCard";

export default function OrdersSection({
  // eslint-disable-next-line no-unused-vars
  orders,
  filteredOrders,
  orderFilter,
  onFilterChange,
  showOrderDetails,
  onToggleDetails,
  onStatusChange,
}) {
  return (
    <div className="col-span-2">
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📦 Orders</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            {filteredOrders.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            "ALL",
            "NEW",
            "ACKNOWLEDGED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "DECLINED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                orderFilter === status
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No orders in this category
          </p>
        ) : (
          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {[...filteredOrders].reverse().map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isExpanded={showOrderDetails === order._id}
                onToggleExpand={() =>
                  onToggleDetails(
                    showOrderDetails === order._id ? null : order._id
                  )
                }
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
