import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/apiService';

const statusClasses = {
  NEW: 'bg-blue-100 text-blue-800',
  ACKNOWLEDGED: 'bg-indigo-100 text-indigo-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function RecentOrders({ limit = 5, onSelect }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    if (onSelect) return onSelect(o);
    // navigate to order details page if available
    navigate(`/orders/${o._id}`);
  };

  return (
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
  );
}
