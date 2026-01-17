import User from "../models/User.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "User deactivated", user });
  } catch (error) {
    res.status(500).json({ message: "Deactivation failed", error: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    res.json({ message: "User activated", user });
  } catch (error) {
    res.status(500).json({ message: "Activation failed", error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const totalOrders = await Order.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered", paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .populate("restaurant", "name");

    res.json({
      totalUsers,
      totalVendors,
      totalOrders,
      totalRestaurants,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order stats", error: error.message });
  }
};

export const approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isActive: true },
      { new: true }
    );
    res.json({ message: "Restaurant approved", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

export const rejectRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "Restaurant rejected", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};
