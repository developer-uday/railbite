import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/apiService";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [prevOrders, setPrevOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("activity");

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrders();
      const ordersData = response.data || response;
      const foundOrder = ordersData.find((o) => String(o.orderId) === String(orderId));
      if (foundOrder) {
        setOrder(foundOrder);
        setStatus(foundOrder.orderStatus || "NEW");
        setAdminNotes(foundOrder.adminNotes || "");
        setActivity(foundOrder.activity || []);
        setError("");
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Allow both admin and regular users to view orders
    loadOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, user, navigate]);

  // load previous orders by same customer/user
  const loadPreviousOrders = async (order) => {
    try {
      const resp = await adminService.getOrders();
      const all = resp.data || [];
      const prev = all.filter((o) => {
        if (!order) return false;
        // match by user id if available, otherwise by customer email
        if (order.user?._id && o.user?._id)
          return o.user._id === order.user._id && o._id !== order._id;
        if (order.customer?.email)
          return (
            o.customer?.email === order.customer.email && o._id !== order._id
          );
        return false;
      });
      setPrevOrders(prev);
    } catch (err) {
      console.error("Failed to load previous orders:", err);
    }
  };

  useEffect(() => {
    if (order) loadPreviousOrders(order);
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      await adminService.updateOrder(order._id, {
        orderStatus: status,
        adminNotes,
      });
      await loadOrderDetails();
    } catch (err) {
      console.error("Failed to update order:", err);
      setError("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "UNDELIVERED":
        return "bg-orange-100 text-orange-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const Card = ({ title, children }) => (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚂 RAILBITE — Order Details</h1>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="font-semibold hover:underline">
              ← Back
            </Link>
            <span className="text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-accent px-4 py-2 rounded font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && <p className="text-center">Loading order details...</p>}

        {!loading && order && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl">
              {/* ========== COLUMN 1 ========== */}
              <div className="flex flex-col justify-between gap-6 bg-white p-6">
                {/* Customer Details */}
                <div className="h-44 border rounded-xl p-4 -mt-6">
                  <h4 className="font-bold mb-2">👤 Customer Details</h4>
                  <h2 className="font-bold">Order #{order.orderId}</h2>
                  <p>
                    Name: {order.customer?.name || "N/A"}
                  </p>
                  <p>
                    Phone: {order.customer?.phone || "N/A"}
                  </p>
                  <p>
                    Email: {order.customer?.email || "N/A"}
                  </p>
                </div>

                {/* Payment Details */}
                <div className="h-44 border rounded-xl p-4">
                  <h4 className="font-bold mb-2">💳 Payment Details</h4>
                  <p>Method: {order.paymentMethod || "N/A"}</p>
                  <p>Status: {order.paymentStatus || "N/A"}</p>
                  <p>Txn ID: {order.paymentTxnId || "N/A"}</p>
                </div>

                {/* Order Time */}
                <div className="h-44 border rounded-xl p-4">
                  <h4 className="font-bold mb-2">⏱ Order Time</h4>
                  <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                  <p>
                    Accepted:{" "}
                    {order.acceptedAt
                      ? new Date(order.acceptedAt).toLocaleString()
                      : "Not Accepted"}
                  </p>
                </div>
              </div>

              {/* ========== COLUMN 2 ========== */}
              <div className="flex flex-col justify-between gap-6">
                {/* Journey Details */}
                <div className="h-44 border rounded-xl p-4 bg-white">
                  <h4 className="font-bold mb-2">🚆 Journey Details</h4>
                  <span className="flex gap-5">
                  <p>PNR: {order.journey?.pnr || "N/A"}</p>
                  <p>Train: {order.journey?.trainNo || "N/A"}</p>
                  </span>
                  <p>
                    Station:{" "}
                    {order.journey?.boarding || order.journey?.station || "N/A"}
                  </p>
                  <p>
                    Coach & Seat: {order.journey?.coach || "N/A"},{" "}
                    {order.journey?.seat || "N/A"}
                  </p>
                  <p>
                    DOJ:{" "}
                    {order.journey?.date || order.journey?.doj
                      ? new Date(order.journey?.date || order.journey?.doj).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    DOD:{" "}
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    DOD Time:{" "}
                    {order.deliveryTime || "N/A"}
                  </p>
                </div>

                {/* Order Items + Customer Notes */}
                <div className="h-44 border rounded-xl p-4 bg-white overflow-y-auto">
                  <h4 className="font-bold mb-2">🍽 Items & Customer Notes</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="text-sm border-b pb-1 mb-1">
                      <div className="font-semibold">{item.name}</div>
                      <div>
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 text-sm">
                    <b>Notes:</b> {order.notes || "None"}
                  </div>
                </div>

                {/* Admin Status + Notes */}
                <div className="h-44 border rounded-xl p-4 bg-white flex flex-col gap-2">
                  <h4 className="font-bold">🛠 Admin Order Control</h4>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="UNDELIVERED">UNDELIVERED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>

                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="border rounded px-2 py-1 w-full resize"
                    placeholder="Admin notes..."
                  />

                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="bg-primary text-white rounded px-3 py-1 font-semibold"
                  >
                    {updating ? "Updating…" : "Update"}
                  </button>
                </div>
              </div>

              {/* ========== COLUMN 3 ========== */}
              <div className="flex flex-col gap-6">
                {/* Restaurant + Vendor Status */}
                <div className="h-44 border rounded-xl p-4 bg-white">
                  <h4 className="font-bold mb-2">🏪 Restaurant / Vendor</h4>
                  <p>Name: {order.restaurant?.name || "N/A"}</p>
                  <p>Location: {order.restaurant?.location || "N/A"}</p>
                  <p>Cuisine: {order.restaurant?.cuisine || "N/A"}</p>

                  <div className="mt-2 text-sm">
                    <b>Order Status by Vendor:</b>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800"
                            : order.orderStatus === "ACKNOWLEDGED"
                            ? "bg-cyan-100 text-cyan-800"
                            : order.orderStatus === "OUT_FOR_DELIVERY"
                            ? "bg-purple-100 text-purple-800"
                            : order.orderStatus === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.orderStatus === "DECLINED"
                            ? "bg-red-100 text-red-800"
                            : order.orderStatus === "FAILED"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.orderStatus || "N/A"}
                      </span>
                    </div>
                    {order.declineReason && (
                      <p className="mt-2 text-red-600">
                        <strong>Decline Reason:</strong> {order.declineReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkout Amount */}
                <div className="h-44 border rounded-xl p-4 bg-white">
                  <h4 className="font-bold mb-2">💰 Checkout Amount</h4>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.pricing?.subtotal || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{order.pricing?.tax || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      ₹
                      {order.pricing?.deliveryFee ||
                        order.pricing?.deliveryCharges ||
                        0}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{order.pricing?.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== ACTIVITY + PREVIOUS ORDERS ========== */}
            <div className="mt-8 bg-white border rounded-xl p-6">
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-2 rounded font-semibold transition ${activeTab === "activity" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Order Activity
                </button>
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`px-4 py-2 rounded font-semibold transition ${activeTab === "orders" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Previous Orders
                </button>
              </div>

              {/* Activity Log Tab */}
              {activeTab === "activity" && (
                <div>
                  <h4 className="font-bold mb-4">📜 Order Activity Log</h4>
                  {activity.length ? (
                    activity.map((a, i) => (
                      <div
                        key={i}
                        className="border-l-4 border-primary bg-gray-50 p-3 mb-2 rounded"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <b>{a.event}</b>
                            {a.details && (
                              <div className="text-sm text-gray-600 mt-1">
                                {a.details.actor && (
                                  <p>
                                    <strong>Actor:</strong> {a.details.actor}
                                  </p>
                                )}
                                {a.details.previousStatus && a.details.newStatus && (
                                  <p>
                                    <strong>Status:</strong> {a.details.previousStatus} →{" "}
                                    {a.details.newStatus}
                                  </p>
                                )}
                                {a.details.reason && (
                                  <p>
                                    <strong>Reason:</strong> {a.details.reason}
                                  </p>
                                )}
                                {typeof a.details === "string" && <p>{a.details}</p>}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(a.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No activity</p>
                  )}
                </div>
              )}

              {/* Previous Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h4 className="font-bold mb-4">
                    🧾 Previous Orders by Customer
                  </h4>
                  {prevOrders.length ? (
                    prevOrders.map((po) => (
                      <div
                        key={po._id}
                        className="border p-3 rounded mb-2 flex justify-between items-center hover:bg-gray-50 transition"
                      >
                        <div>
                          <div className="font-semibold">
                            Order #{po.orderId || po._id?.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(po.createdAt).toLocaleString()}
                          </div>
                          <div className={`text-xs font-semibold mt-1 px-2 py-1 rounded w-fit ${getStatusColor(po.orderStatus)}`}>
                            {po.orderStatus || "N/A"}
                          </div>
                        </div>
                        <a
                          href={`/orders/${po.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:text-accent text-sm font-semibold"
                          title={`Order ID: ${po.orderId || 'N/A'}`}
                        >
                          View
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No previous orders</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
