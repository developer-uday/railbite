export default function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onStatusChange,
}) {
  const getStatusBadgeColor = (status) => {
    const colors = {
      NEW: "bg-yellow-100 text-yellow-800",
      ACKNOWLEDGED: "bg-blue-100 text-blue-800",
      OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      DECLINED: "bg-red-100 text-red-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="border border-gray-300 rounded-lg p-4 cursor-pointer transition hover:shadow-lg bg-white"
      onClick={() => onToggleExpand(order._id)}
    >
      {/* Order Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-lg">Order #{order.orderId}</p>
          <p className="text-xs text-gray-600">by {order.customer?.name}</p>
          {order.journey && (
            <p className="text-xs text-gray-600 font-semibold mt-1">
              🚂 {order.journey?.trainNo} | PNR: {order.journey?.pnr} | Coach{" "}
              {order.journey?.coach}, Seat {order.journey?.seat}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">₹{order.pricing?.finalAmount}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="bg-white bg-opacity-50 rounded p-2 mb-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1">Items:</p>
        {order.items?.slice(0, 2).map((item, idx) => (
          <p key={idx} className="text-gray-600">
            • {item.name} x{item.quantity}
          </p>
        ))}
        {order.items?.length > 2 && (
          <p className="text-gray-600">• +{order.items.length - 2} more</p>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3 text-sm bg-white bg-opacity-60 rounded p-3">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-gray-800">Customer</p>
              <p className="text-gray-700">{order.customer?.name}</p>
              <p className="text-xs text-gray-600">📞 {order.customer?.phone}</p>
              <p className="text-xs text-gray-600">✉️ {order.customer?.email}</p>
            </div>

            {/* Journey Details */}
            {order.journey && (
              <div>
                <p className="font-bold text-gray-800">Journey</p>
                <p className="text-gray-700">🚂 {order.journey?.trainNo}</p>
                <p className="text-xs text-gray-600">PNR: {order.journey?.pnr}</p>
                <p className="text-xs text-gray-600">
                  Coach {order.journey?.coach}, Seat {order.journey?.seat}
                </p>
              </div>
            )}
          </div>

          {/* Full Items List */}
          <div>
            <p className="font-bold text-gray-800 mb-1">Order Items</p>
            <div className="bg-gray-50 rounded p-2 space-y-1">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-700">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-gray-800">Payment Method</p>
              <p className="text-gray-700">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="font-bold text-gray-800">Status</p>
              <p className="text-gray-700">{order.pricing?.paymentStatus}</p>
            </div>
          </div>

          {/* Decline Reason */}
          {order.declineReason && (
            <div className="bg-red-100 p-3 rounded border-l-4 border-red-500">
              <p className="text-red-800">
                <strong>Decline Reason:</strong> {order.declineReason}
              </p>
            </div>
          )}

          {/* Action Buttons - IMPROVED VISIBILITY */}
          {order.orderStatus !== "DELIVERED" && order.orderStatus !== "DECLINED" && (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300">
              {order.orderStatus === "NEW" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order._id, "ACKNOWLEDGED");
                  }}
                  className="bg-blue-600 text-white py-2 rounded font-semibold transition hover:bg-blue-700 active:bg-blue-800 shadow-md"
                >
                  ✓ Acknowledge
                </button>
              )}
              {order.orderStatus === "ACKNOWLEDGED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order._id, "OUT_FOR_DELIVERY");
                  }}
                  className="bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-700 active:bg-purple-800 shadow-md"
                >
                  📦 Out for Delivery
                </button>
              )}
              {order.orderStatus === "OUT_FOR_DELIVERY" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order._id, "DELIVERED");
                  }}
                  className="bg-green-600 text-white py-2 rounded font-semibold transition hover:bg-green-700 active:bg-green-800 shadow-md"
                >
                  ✓ Delivered
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(order._id, "DECLINED");
                }}
                className="bg-red-600 text-white py-2 rounded font-semibold transition hover:bg-red-700 active:bg-red-800 shadow-md col-span-2 md:col-span-1"
              >
                ✗ Decline
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
