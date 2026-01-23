import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartSidebar from "../components/user/CartSidebar";
import MenuDisplay from "../components/user/MenuDisplay";
import RecentOrders from "../components/user/RecentOrders";
import RestaurantsList from "../components/user/RestaurantsList";
import TrainSearch from "../components/user/TrainSearch";
import UserHeader from "../components/user/UserHeader";
import { useAuth } from "../hooks/useAuth";
import api, { orderService } from "../services/apiService";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [pnrOrTrain, setPnrOrTrain] = useState("");
  const [train, setTrain] = useState(null);
  const [stations, setStations] = useState([]);
  const [menu, setMenu] = useState([]);
  const [journeyDate, setJourneyDate] = useState("");
  const [selectedStation, setSelectedStation] = useState(null);
  const [currentStation, setCurrentStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    number: "",
    email: "",
    pnr: "",
    seatNumber: "",
    coachNumber: "",
    deliveryDate: "",
    deliveryTime: "",
    paymentMode: "CASH",
    notes: "",
  });

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/login");
    }
  }, [user, navigate]);

  const addToCart = useCallback(
    (item) => {
      const existingItem = cart.find((c) => c._id === item._id);
      if (existingItem) {
        setCart(
          cart.map((c) =>
            c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c,
          ),
        );
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
      }
    },
    [cart],
  );

  const removeFromCart = useCallback(
    (index) => {
      setCart(cart.filter((_, i) => i !== index));
    },
    [cart],
  );

  const handlePnrChange = useCallback((e) => {
    setPnrOrTrain(e.target.value);
  }, []);

  const handleSearchTrain = async (date) => {
    if (!pnrOrTrain.trim()) {
      setError("Please enter a train number");
      return;
    }

    if (!date) {
      setError("Please select a journey date");
      return;
    }

    try {
      setLoading(true);

      // Call the train API endpoint with train number
      const resp = await api.get(`/train/${pnrOrTrain}`);
      const trainData = resp.data;

      if (trainData && trainData.stations && trainData.stations.length > 0) {
        const formattedTrain = {
          trainNumber: trainData.trainNo,
          trainName: trainData.trainName,
          source: trainData.source || trainData.stations[0].name,
          destination:
            trainData.destination ||
            trainData.stations[trainData.stations.length - 1].name,
          stations: trainData.stations,
        };

        setTrain(formattedTrain);
        setStations(trainData.stations);
        setCurrentStation(trainData.currentStation || "");
        setJourneyDate(date);
        setSelectedStation(null);

        // For now, set empty restaurants - will load when user selects station
        setRestaurants([]);
        setSelectedRestaurant(null);
        setMenu([]);
        setCart([]);
        setError("");
      } else {
        setTrain(null);
        setStations([]);
        setRestaurants([]);
        setError("Train not found or no stations available");
      }
    } catch (err) {
      console.error("Failed to search trains:", err);
      setTrain(null);
      setStations([]);
      setRestaurants([]);
      const errorMsg =
        err.response?.data?.message || "Train not found or invalid number";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = useCallback(async (restaurant) => {
    try {
      setLoading(true);
      setError("");
      setSelectedRestaurant(restaurant);

      console.log(
        "Loading menu for restaurant:",
        restaurant._id,
        restaurant.name,
      );

      const resp = await api.get(`/vendors/restaurants/${restaurant._id}/menu`);

      console.log("Menu response:", resp.data);

      // Handle both array and object response formats
      const menuData = Array.isArray(resp.data)
        ? resp.data
        : resp.data.menu || [];

      console.log("Menu items:", menuData);

      setMenu(menuData);
      setCart([]); // Clear cart when selecting new restaurant
    } catch (err) {
      console.error(
        "Error loading menu:",
        err.response?.status,
        err.response?.data || err.message,
      );
      setMenu([]);
      setError(
        `Failed to load menu: ${err.response?.data?.message || err.message}`,
      );
      setSelectedRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectStation = useCallback(async (station) => {
    try {
      setLoading(true);
      setSelectedStation(station);
      setError("");

      // Fetch restaurants available at this station
      const resp = await api.get(
        `/vendors/restaurants/station/${encodeURIComponent(station.name)}`,
      );

      if (resp.data.success && resp.data.restaurants) {
        setRestaurants(resp.data.restaurants);
        setSelectedRestaurant(null);
        setMenu([]);
        setCart([]);
      } else {
        setRestaurants([]);
        setError(`No restaurants found at ${station.name}`);
      }
    } catch (err) {
      console.error("Failed to load restaurants for station:", err);
      setRestaurants([]);
      setError("Failed to load restaurants for this station");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCheckoutChange = useCallback((field, value) => {
    setCheckoutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmitCheckout = useCallback(async () => {
    try {
      setLoading(true);

      const orderData = {
        restaurantId: selectedRestaurant?._id,
        items: cart.map((item) => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        customer: {
          name: checkoutData.fullName,
          email: checkoutData.email,
          phone: checkoutData.number,
        },
        journey: {
          trainNo: train?.trainNumber,
          doj: journeyDate,
          pnr: checkoutData.pnr,
          seat: checkoutData.seatNumber,
          coach: checkoutData.coachNumber,
          station: selectedStation?.name,
        },
        pricing: {
          subtotal: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          deliveryFee: 20,
          total:
            cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
            20,
        },
        paymentMethod: checkoutData.paymentMode === "CASH" ? "COD" : "PREPAID",
        deliveryDate: checkoutData.deliveryDate,
        deliveryTime: checkoutData.deliveryTime,
        notes: checkoutData.notes,
      };

      console.log("Placing order with data:", orderData);

      const resp = await orderService.createOrder(orderData);

      console.log("Order response:", resp.data);

      // Reset form
      setCart([]);
      setCheckoutData({
        fullName: "",
        number: "",
        email: "",
        pnr: "",
        seatNumber: "",
        coachNumber: "",
        deliveryDate: "",
        deliveryTime: "",
        paymentMode: "CASH",
        notes: "",
      });
      setShowCheckout(false);
      setError("");
      alert(
        "Order placed successfully! Order ID: " +
          (resp.data.order?.orderId || "N/A"),
      );
    } catch (err) {
      console.error(
        "Failed to place order:",
        err.response?.data || err.message,
      );
      setError(
        "Failed to place order: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  }, [
    train,
    selectedRestaurant,
    cart,
    checkoutData,
    journeyDate,
    selectedStation,
  ]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader userName={user?.name || "User"} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto p-3 md:p-6">
        {error && (
          <div className="mb-4 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Section - Restaurants and Menu */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <TrainSearch
              pnrOrTrain={pnrOrTrain}
              onPnrChange={handlePnrChange}
              onSearch={handleSearchTrain}
              train={train}
              stations={stations}
              onSelectStation={handleSelectStation}
              currentStation={currentStation}
            />

            <RestaurantsList
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={handleSelectRestaurant}
            />

            <MenuDisplay
              restaurant={selectedRestaurant}
              menu={menu}
              onAddToCart={addToCart}
            />
          </div>

          {/* Right Section - Recent Orders + Cart */}
          <div className="lg:col-span-1 space-y-4">
            <RecentOrders />
            <CartSidebar
              cart={cart}
              onRemoveItem={removeFromCart}
              onCheckout={() => setShowCheckout(true)}
            />
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <h3 className="font-bold mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-2 font-bold">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        ₹
                        {cart.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span>₹20</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Total:</span>
                      <span>
                        ₹
                        {cart.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0,
                        ) + 20}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={checkoutData.fullName}
                  onChange={(e) =>
                    handleCheckoutChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Number
                </label>
                <input
                  type="tel"
                  value={checkoutData.number}
                  onChange={(e) =>
                    handleCheckoutChange("number", e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  placeholder="your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={checkoutData.email}
                  onChange={(e) =>
                    handleCheckoutChange("email", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex items-center">
                <label className=" w-full block text-sm font-semibold mb-1">
                  Coach & Seat
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={checkoutData.coachNumber}
                    onChange={(e) =>
                      handleCheckoutChange("coachNumber", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                    placeholder="e.g., B1"
                  />
                  <input
                    type="text"
                    value={checkoutData.seatNumber}
                    onChange={(e) =>
                      handleCheckoutChange("seatNumber", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                    placeholder="e.g., 46"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  PNR / Booking Reference
                </label>
                <input
                  type="text"
                  value={checkoutData.pnr}
                  onChange={(e) => handleCheckoutChange("pnr", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  placeholder="e.g., 6234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Delivery Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={checkoutData.deliveryDate}
                    onChange={(e) =>
                      handleCheckoutChange("deliveryDate", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  />
                  <input
                    type="time"
                    value={checkoutData.deliveryTime}
                    onChange={(e) =>
                      handleCheckoutChange("deliveryTime", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Delivery time at {selectedStation?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Payment Mode
                </label>
                <select
                  value={checkoutData.paymentMode}
                  onChange={(e) =>
                    handleCheckoutChange("paymentMode", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                >
                  <option value="CASH">Cash on Delivery</option>
                  <option value="PREPAID">Prepaid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={checkoutData.notes}
                  onChange={(e) =>
                    handleCheckoutChange("notes", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary outline-none"
                  rows="3"
                  placeholder="Any special requests?"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded font-semibold transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCheckout}
                  className="flex-1 bg-secondary hover:bg-yellow-500 text-white py-2 rounded font-semibold transition disabled:opacity-50"
                  disabled={
                    loading ||
                    !checkoutData.fullName ||
                    !checkoutData.seatNumber
                  }
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
