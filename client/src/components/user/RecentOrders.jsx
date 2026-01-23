import { useEffect, useState } from 'react';
import { orderService } from '../../services/apiService';

const statusClasses = {
  NEW: 'bg-gray-100 text-gray-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  UNDELIVERED: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

export default function RecentOrders({ limit = 5, onSelect }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await orderService.getRecentOrders(limit);
      if (resp.data && resp.data.success) {
        setOrders(resp.data.orders || []);
      } else if (Array.isArray(resp.data)) {
        setOrders(resp.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load recent orders', err);
      setError('Failed to load recent orders');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [limit]);

  const handleView = (o) => {
    // Show modal dialog
    setSelectedOrder(o);
    // Also call onSelect if provided (for backward compatibility)
    if (onSelect) {
      onSelect(o);
    }
  };

  return (
    <>
      <div className="mb-4 bg-white p-3 rounded shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Recent Orders</h3>
          <button onClick={load} className="text-sm text-secondary">Refresh</button>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {!loading && orders.length === 0 && (
          <div className="text-sm text-gray-500">No recent orders</div>
        )}

        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o._id} className="p-2 rounded border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{o.orderId}</div>
                  <div className="text-xs text-gray-500">{o.restaurant?.name || 'Restaurant'} • {o.itemCount} items</div>
                  {o.itemsPreview && o.itemsPreview.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">{o.itemsPreview.join(', ')}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleString()}</div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-sm font-semibold">₹{o.total}</div>

                  <div className="flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[o.orderStatus] || 'bg-yellow-100 text-yellow-800'}`}>
                      {o.orderStatus}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {o.paymentStatus}
                    </span>
                  </div>

                  <button onClick={() => handleView(o)} className="mt-1 text-sm text-secondary">View</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="border-b pb-2">
                <p className="text-gray-600">Order ID</p>
                <p className="font-semibold">{selectedOrder.orderId}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Station</p>
                <p className="font-semibold">{selectedOrder.journey?.boarding || selectedOrder.journey?.station || 'N/A'}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Restaurant</p>
                <p className="font-semibold">{selectedOrder.restaurant?.name || 'N/A'}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[selectedOrder.orderStatus] || 'bg-yellow-100 text-yellow-800'}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Payment Status</p>
                <p className="font-semibold">{selectedOrder.paymentStatus}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Items</p>
                <div className="space-y-1 mt-1">
                  {selectedOrder.itemsPreview?.map((item, idx) => (
                    <p key={idx} className="font-semibold">• {item}</p>
                  ))}
                </div>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Total Amount</p>
                <p className="font-bold text-lg">₹{selectedOrder.total}</p>
              </div>

              <div className="border-b pb-2">
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              {/* Payment option for PREPAID orders */}
              {selectedOrder.paymentMethod === 'PREPAID' && (
                <div className="border-b pb-2">
                  <p className="text-gray-600">Payment</p>
                  {selectedOrder.paymentStatus === 'PAID' ? (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ Paid
                      </span>
                    </div>
                  ) : (
                    <button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold transition">
                      Pay Now
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedOrder(null);
                }}
                className="w-full mt-4 bg-secondary hover:bg-yellow-500 text-white py-2 rounded font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
