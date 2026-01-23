import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../services/apiService";
import VendorHeader from "../components/vendor/VendorHeader";
import StatsDashboard from "../components/vendor/StatsDashboard";
import RestaurantInfoCard from "../components/vendor/RestaurantInfoCard";
import OrdersSection from "../components/vendor/OrdersSection";
import MenuManagement from "../components/vendor/MenuManagement";
import EditRestaurantForm from "../components/vendor/EditRestaurantForm";

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    category: "Veg",
    description: "",
  });
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderFilter, setOrderFilter] = useState("ALL");

  const loadVendorData = useCallback(async () => {
    try {
      setLoading(true);
      const restaurantRes = await vendorService.getRestaurant();
      setRestaurant(restaurantRes.data.restaurant);

      const menuRes = await vendorService.getMenu(
        restaurantRes.data.restaurant._id
      );
      setMenu(menuRes.data.menu || []);

      const ordersRes = await vendorService.getOrders();
      setOrders(ordersRes.data.orders || []);

      setError(null);
    } catch (error) {
      console.error("Failed to load vendor data:", error);
      if (error.response?.status === 404) {
        setError("No restaurant found. Please create a restaurant first.");
      } else {
        setError(error.response?.data?.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "vendor") {
      navigate("/login");
    } else {
      loadVendorData();
    }
  }, [user, navigate, loadVendorData]);

  // Calculate stats
  const vendorVisibleStatuses = ["ACCEPTED", "ACKNOWLEDGED", "OUT_FOR_DELIVERY", "DELIVERED", "DECLINED", "FAILED", "UNDELIVERED"];
  const vendorOrders = orders.filter(o => vendorVisibleStatuses.includes(o.orderStatus));

  const stats = {
    totalOrders: vendorOrders.length,
    newOrders: vendorOrders.filter((o) => o.orderStatus === "ACCEPTED").length,
    delivered: vendorOrders.filter((o) => o.orderStatus === "DELIVERED").length,
    totalRevenue: vendorOrders.reduce(
      (sum, o) => sum + (o.pricing?.total || 0),
      0
    ),
    activeItems: menu.filter((m) => m.isAvailable).length,
    totalItems: menu.length,
  };

  const filteredOrders =
    orderFilter === "ALL"
      ? vendorOrders
      : vendorOrders.filter((o) => o.orderStatus === orderFilter);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuId) {
        const res = await vendorService.updateMenuItem(
          restaurant._id,
          editingMenuId,
          {
            name: newMenuItem.name,
            price: parseFloat(newMenuItem.price),
            category: newMenuItem.category,
            description: newMenuItem.description,
          }
        );
        setMenu(
          menu.map((item) =>
            item._id === editingMenuId ? res.data.menuItem : item
          )
        );
        setEditingMenuId(null);
      } else {
        const res = await vendorService.addMenuItem(restaurant._id, {
          name: newMenuItem.name,
          price: parseFloat(newMenuItem.price),
          category: newMenuItem.category,
          description: newMenuItem.description,
        });
        setMenu([...menu, res.data.menuItem]);
      }
      setNewMenuItem({ name: "", price: "", category: "Veg", description: "" });
      setShowAddMenuItem(false);
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMenuItem = async (menuId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await vendorService.deleteMenuItem(restaurant._id, menuId);
      setMenu(menu.filter((item) => item._id !== menuId));
    } catch (error) {
      alert(
        "Error deleting menu item: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleEditMenuItem = (item) => {
    setNewMenuItem({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
    });
    setEditingMenuId(item._id);
    setShowAddMenuItem(true);
  };

  const handleToggleAvailability = async (menuId, currentStatus) => {
    try {
      await vendorService.toggleMenuAvailability(
        restaurant._id,
        menuId,
        !currentStatus
      );
      setMenu(
        menu.map((item) =>
          item._id === menuId ? { ...item, isAvailable: !currentStatus } : item
        )
      );
    } catch (error) {
      alert(
        "Error updating menu item: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleOrderStatusChange = async (
    orderId,
    newStatus,
    declineReason = null
  ) => {
    if (newStatus === "DECLINED" && !declineReason) {
      const reason = window.prompt(
        "Please provide a reason for declining this order:"
      );
      if (!reason) return;
      declineReason = reason;
    }

    try {
      let res;
      if (newStatus === "DECLINED") {
        res = await vendorService.declineOrder(orderId, declineReason);
      } else {
        res = await vendorService.updateOrderStatus(
          orderId,
          newStatus,
          declineReason
        );
      }
      setOrders(
        orders.map((order) => (order._id === orderId ? res.data.order : order))
      );
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      alert(
        "Error updating order: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAcknowledgeOrder = async (orderId) => {
    try {
      const res = await vendorService.acknowledgeOrder(orderId);
      setOrders(
        orders.map((order) => (order._id === orderId ? res.data.order : order))
      );
      alert("Order acknowledged successfully");
    } catch (error) {
      alert(
        "Error acknowledging order: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // const getStatusColor = (status) => {
  //   const colors = {
  //     NEW: "bg-yellow-100 text-yellow-800 border-yellow-400",
  //     ACKNOWLEDGED: "bg-blue-100 text-blue-800 border-blue-400",
  //     OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800 border-purple-400",
  //     DELIVERED: "bg-green-100 text-green-800 border-green-400",
  //     DECLINED: "bg-red-100 text-red-800 border-red-400",
  //     FAILED: "bg-red-100 text-red-800 border-red-400",
  //   };
  //   return colors[status] || "bg-gray-100 text-gray-800 border-gray-400";
  // };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-black p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">🚂 RAILBITE - Vendor</h1>
            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-yellow-800">
              Welcome to RAILBITE Vendor Panel
            </h2>
            <p className="text-yellow-700 mb-6">
              You need to create a restaurant to get started.
            </p>
            <button
              onClick={() => navigate("/vendor-setup")}
              className="bg-primary hover:bg-gray-700 text-white px-6 py-3 rounded font-semibold"
            >
              Create Restaurant
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <VendorHeader
        restaurantName={restaurant?.name}
        rating={restaurant?.rating}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        <StatsDashboard stats={stats} />

        <RestaurantInfoCard
          restaurant={restaurant}
          onEdit={() => setShowEditRestaurant(!showEditRestaurant)}
        />

        {showEditRestaurant && (
          <EditRestaurantForm
            restaurant={restaurant}
            onClose={() => setShowEditRestaurant(false)}
            onSave={(updatedRestaurant) => {
              setRestaurant(updatedRestaurant);
              setShowEditRestaurant(false);
            }}
          />
        )}

        <div className="grid grid-cols-3 gap-6">
          <OrdersSection
            orders={orders}
            filteredOrders={filteredOrders}
            orderFilter={orderFilter}
            onFilterChange={setOrderFilter}
            showOrderDetails={showOrderDetails}
            onToggleDetails={setShowOrderDetails}
            onStatusChange={handleOrderStatusChange}
            onAcknowledge={handleAcknowledgeOrder}
          />

          <MenuManagement
            menu={menu}
            showAddMenuItem={showAddMenuItem}
            onToggleAddItem={() => {
              setShowAddMenuItem(!showAddMenuItem);
              setEditingMenuId(null);
              setNewMenuItem({
                name: "",
                price: "",
                category: "Veg",
                description: "",
              });
            }}
            newMenuItem={newMenuItem}
            onMenuItemChange={setNewMenuItem}
            onAddMenuItem={handleAddMenuItem}
            editingMenuId={editingMenuId}
            onEdit={handleEditMenuItem}
            onDelete={handleDeleteMenuItem}
            onToggleAvailability={handleToggleAvailability}
          />
        </div>
      </main>
    </div>
  );
}
