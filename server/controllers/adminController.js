import User from "../models/User.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    
    // Get order counts for each user
    const usersWithOrderCounts = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          orders: orderCount,
        };
      })
    );
    
    res.json(usersWithOrderCounts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select("-password");
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
    ).select("-password");
    res.json({ message: "User activated", user });
  } catch (error) {
    res.status(500).json({ message: "Activation failed", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
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

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" })
      .select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendors", error: error.message });
  }
};

export const getVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId)
      .select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor", error: error.message });
  }
};

export const suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isActive: false },
      { new: true }
    ).select("-password");
    res.json({ message: "Vendor suspended", vendor });
  } catch (error) {
    res.status(500).json({ message: "Suspension failed", error: error.message });
  }
};

export const approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isActive: true },
      { new: true }
    ).select("-password");
    res.json({ message: "Vendor approved", vendor });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

export const rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    await User.findByIdAndDelete(vendorId);
    res.json({ message: "Vendor rejected and removed" });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    await User.findByIdAndDelete(vendorId);
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("vendor", "name email");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch restaurants", error: error.message });
  }
};

export const getRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId).populate("vendor", "name email");
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch restaurant", error: error.message });
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

export const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    await Restaurant.findByIdAndDelete(restaurantId);
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("restaurant", "name")
      .populate("items.itemId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("restaurant", "name")
      .populate("items.itemId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "CANCELLED" },
      { new: true }
    ).populate("user", "name email").populate("restaurant", "name");
    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, adminNotes } = req.body;
    
    if (!orderStatus && !adminNotes) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Add activity log entry if status changed
    if (orderStatus) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      if (!order.activity) order.activity = [];
      order.activity.push({
        timestamp: new Date(),
        event: `Status updated to ${orderStatus} by admin`,
        details: adminNotes || null,
      });
      updateData.activity = order.activity;
    }

    const updated = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate("user", "name email")
      .populate("restaurant", "name");
    
    if (!updated) return res.status(404).json({ message: "Order not found" });
    
    res.json({ message: "Order updated successfully", order: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      role: "user",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

export const searchVendors = async (req, res) => {
  try {
    const { q } = req.query;
    const vendors = await User.find({
      role: "vendor",
      name: { $regex: q, $options: "i" },
    })
      .select("-password");
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

export const searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;
    const restaurants = await Restaurant.find({
      name: { $regex: q, $options: "i" },
    }).populate("vendor", "name email");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

// ==================== MANAGER MANAGEMENT ====================

export const createManager = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new manager
    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "manager",
      isVerified: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Manager created successfully",
      manager: manager.toObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create manager",
      error: error.message,
    });
  }
};

export const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" }).select("-password");
    res.json({
      success: true,
      managers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch managers",
      error: error.message,
    });
  }
};

export const getManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const manager = await User.findById(managerId).select("-password");

    if (!manager || manager.role !== "manager") {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.json({
      success: true,
      manager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager",
      error: error.message,
    });
  }
};

export const updateManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { name, email, phone, isActive } = req.body;

    // Check if email is being changed and if new email exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: managerId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const manager = await User.findByIdAndUpdate(managerId, updateData, {
      new: true,
    }).select("-password");

    if (!manager || manager.role !== "manager") {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.json({
      success: true,
      message: "Manager updated successfully",
      manager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update manager",
      error: error.message,
    });
  }
};

export const deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await User.findByIdAndDelete(managerId);

    if (!manager || manager.role !== "manager") {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    res.json({
      success: true,
      message: "Manager deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete manager",
      error: error.message,
    });
  }
};
