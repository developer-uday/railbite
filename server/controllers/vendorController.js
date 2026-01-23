import Restaurant from "../models/Restaurant.js";
import Menu from "../models/Menu.js";
import Order from "../models/Order.js";

/* ===================== UTILITY FUNCTIONS ===================== */

/**
 * Check if store is currently open
 * Returns { isOpen: boolean, reason?: string }
 */
const isStoreOpen = (restaurant) => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const currentDate = now;

  // Check temporary closure
  if (restaurant.temporaryClosure?.from && restaurant.temporaryClosure?.to) {
    if (currentDate >= restaurant.temporaryClosure.from && currentDate <= restaurant.temporaryClosure.to) {
      return { isOpen: false, reason: "TEMPORARY_CLOSURE" };
    }
  }

  // Check break time
  if (restaurant.breakTime?.from && restaurant.breakTime?.to) {
    if (currentTime >= restaurant.breakTime.from && currentTime <= restaurant.breakTime.to) {
      return { isOpen: false, reason: "BREAK_TIME" };
    }
  }

  // Check operating hours
  if (currentTime < restaurant.operatingHours.open || currentTime > restaurant.operatingHours.close) {
    return { isOpen: false, reason: "CLOSED" };
  }

  return { isOpen: true };
};

/**
 * Check delivery feasibility
 * Returns { feasible: boolean, minDeliveryTime?: number }
 */
const isDeliveryFeasible = (restaurant, maxDistance = 10) => {
  const distance = restaurant.distanceFromStation || 0;
  const minPrepTime = restaurant.minPreparationTime || 20;
  const totalMinTime = distance * 2 + minPrepTime; // rough estimate: 2 min per km + prep time

  if (distance > maxDistance) {
    return { feasible: false, reason: "DISTANCE_EXCEEDED" };
  }

  return { feasible: true, minDeliveryTime: totalMinTime };
};

/* ===================== RESTAURANT ===================== */

export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...req.body,
      vendor: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVendorRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ vendor: req.user.id });
    res.json({ success: true, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // Add real-time availability info
    const availability = isStoreOpen(restaurant);
    const deliveryFeasibility = isDeliveryFeasible(restaurant);

    res.json({ 
      success: true, 
      restaurant: {
        ...restaurant.toObject(),
        currentStatus: {
          isOpen: availability.isOpen,
          reason: availability.reason,
          deliveryFeasible: deliveryFeasibility.feasible,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    // Verify vendor owns this restaurant
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      vendor: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.restaurantId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Restaurant updated successfully", restaurant: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findOneAndDelete({
      _id: req.params.restaurantId,
      vendor: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.json({ success: true, message: "Restaurant deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===================== MENU MANAGEMENT ===================== */

export const getRestaurantMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ restaurant: req.params.restaurantId });
    res.json({ success: true, menu });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    // Verify vendor owns the restaurant
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      vendor: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ success: false, message: "Unauthorized: Restaurant not found" });
    }

    const { name, description, image, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, category",
      });
    }

    const menuItem = await Menu.create({
      restaurant: req.params.restaurantId,
      name,
      description,
      image,
      price,
      category,
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      menuItem,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { menuId, restaurantId } = req.params;

    // Verify vendor owns the restaurant
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      vendor: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ success: false, message: "Unauthorized: Restaurant not found" });
    }

    // Verify menu item belongs to this restaurant
    const menuItem = await Menu.findOne({
      _id: menuId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const updated = await Menu.findByIdAndUpdate(menuId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleMenuItemAvailability = async (req, res) => {
  try {
    const { menuId, restaurantId } = req.params;
    const { isAvailable } = req.body;

    // Verify vendor owns the restaurant
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      vendor: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ success: false, message: "Unauthorized: Restaurant not found" });
    }

    // Verify menu item belongs to this restaurant
    const menuItem = await Menu.findOne({
      _id: menuId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const updated = await Menu.findByIdAndUpdate(
      menuId,
      { isAvailable },
      { new: true }
    );

    res.json({
      success: true,
      message: `Menu item ${isAvailable ? "enabled" : "disabled"} successfully`,
      menuItem: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { menuId, restaurantId } = req.params;

    // Verify vendor owns the restaurant
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      vendor: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ success: false, message: "Unauthorized: Restaurant not found" });
    }

    // Verify menu item belongs to this restaurant
    const menuItem = await Menu.findOne({
      _id: menuId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    // Soft delete: disable instead of hard delete
    const updated = await Menu.findByIdAndUpdate(
      menuId,
      { isAvailable: false },
      { new: true }
    );

    res.json({
      success: true,
      message: "Menu item deleted (disabled) successfully",
      menuItem: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===================== ORDER MANAGEMENT ===================== */

export const getVendorOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    // Only return orders with vendor-visible statuses
    const vendorVisibleStatuses = ["ACCEPTED", "ACKNOWLEDGED", "OUT_FOR_DELIVERY", "DELIVERED", "DECLINED", "FAILED", "UNDELIVERED"];
    
    const orders = await Order.find({ 
      restaurant: restaurant._id,
      orderStatus: { $in: vendorVisibleStatuses }
    })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify vendor owns the restaurant for this order
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, declineReason } = req.body;

    // Verify vendor owns the restaurant for this order
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Enforce immutability: DELIVERED status cannot be changed
    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update order status: Order already delivered (immutable)",
      });
    }

    // Validate status transitions and allowed statuses
    const validStatuses = ["OUT_FOR_DELIVERY", "DECLINED", "FAILED", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // ACKNOWLEDGED orders can go to OUT_FOR_DELIVERY or DECLINED
    if (order.orderStatus === "ACKNOWLEDGED") {
      if (!["OUT_FOR_DELIVERY", "DECLINED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "ACKNOWLEDGED orders can only be marked OUT_FOR_DELIVERY or DECLINED",
        });
      }
    }

    // OUT_FOR_DELIVERY orders can go to DELIVERED or FAILED
    if (order.orderStatus === "OUT_FOR_DELIVERY") {
      if (!["DELIVERED", "FAILED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "OUT_FOR_DELIVERY orders can only be marked DELIVERED or FAILED",
        });
      }
    }

    // DECLINED requires mandatory reason
    if (status === "DECLINED" && !declineReason) {
      return res.status(400).json({
        success: false,
        message: "Decline reason is mandatory when declining an order",
      });
    }

    // Build update object
    const updateData = {
      orderStatus: status,
    };

    // Add activity log entry
    const activityEvent = `Vendor ${status === "DECLINED" ? "declined" : status === "OUT_FOR_DELIVERY" ? "marked out for delivery" : status === "DELIVERED" ? "marked delivered" : "marked failed"} order`;
    const activityDetails = {
      previousStatus: order.orderStatus,
      newStatus: status,
      actor: "vendor",
      timestamp: new Date(),
    };

    if (status === "DECLINED") {
      updateData.declineReason = declineReason;
      activityDetails.reason = declineReason;

      // Auto-refund if prepaid
      if (order.paymentMethod === "PREPAID") {
        updateData.refundedAmount = order.pricing.finalAmount;
        updateData.refundedAt = new Date();
        updateData.pricing = {
          ...order.pricing,
          paymentStatus: "REFUNDED",
        };
      }
    }

    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    // Add to activity log
    if (!updateData.activity) {
      updateData.activity = order.activity || [];
    }
    updateData.activity.push({
      timestamp: new Date(),
      event: activityEvent,
      details: activityDetails,
    });

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const acknowledgeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Vendor can only acknowledge ACCEPTED orders
    if (order.orderStatus !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "Only ACCEPTED orders can be acknowledged by vendor",
      });
    }

    // Add activity log entry
    const activityEntry = {
      timestamp: new Date(),
      event: "Vendor acknowledged order",
      details: {
        previousStatus: order.orderStatus,
        newStatus: "ACKNOWLEDGED",
        actor: "vendor",
        timestamp: new Date(),
      },
    };

    const updateData = {
      orderStatus: "ACKNOWLEDGED",
      activity: [...(order.activity || []), activityEntry],
    };

    const updated = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Order acknowledged successfully",
      order: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const declineOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { declineReason } = req.body;

    if (!declineReason) {
      return res.status(400).json({
        success: false,
        message: "Decline reason is mandatory",
      });
    }

    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Vendor can only decline ACCEPTED orders (before acknowledging) or ACKNOWLEDGED orders
    if (!["ACCEPTED", "ACKNOWLEDGED"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot decline order with status ${order.orderStatus}`,
      });
    }

    // Add activity log entry
    const activityEntry = {
      timestamp: new Date(),
      event: "Vendor declined order",
      details: {
        previousStatus: order.orderStatus,
        newStatus: "DECLINED",
        actor: "vendor",
        reason: declineReason,
        timestamp: new Date(),
      },
    };

    const updateData = {
      orderStatus: "DECLINED",
      declineReason: declineReason,
      activity: [...(order.activity || []), activityEntry],
    };

    // Auto-refund if prepaid
    if (order.paymentMethod === "PREPAID") {
      updateData.refundedAmount = order.pricing.finalAmount;
      updateData.refundedAt = new Date();
      updateData.pricing = {
        ...order.pricing,
        paymentStatus: "REFUNDED",
      };
    }

    const declined = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Order declined successfully",
      order: declined,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const getStoreStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const availability = isStoreOpen(restaurant);
    const feasibility = isDeliveryFeasible(restaurant);

    res.json({
      success: true,
      storeStatus: {
        restaurant: restaurant.name,
        operatingHours: restaurant.operatingHours,
        breakTime: restaurant.breakTime,
        temporaryClosure: restaurant.temporaryClosure,
        isOpen: availability.isOpen,
        closureReason: availability.reason,
        canAcceptOrders: availability.isOpen && feasibility.feasible,
        deliveryFeasible: feasibility.feasible,
        minPrepTime: restaurant.minPreparationTime,
        distance: restaurant.distanceFromStation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get restaurants available at a specific station
 * GET /api/vendors/restaurants/station/:stationName
 */
export const getRestaurantsByStation = async (req, res) => {
  try {
    const { stationName } = req.params;

    if (!stationName) {
      return res.status(400).json({ success: false, message: "Station name is required" });
    }

    // Find all restaurants that are operational at this station
    const restaurants = await Restaurant.find({
      station: { $regex: stationName, $options: "i" }
    }).select('-menu -orders -createdAt -updatedAt');

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No restaurants found for station: ${stationName}` 
      });
    }

    res.json({
      success: true,
      count: restaurants.length,
      station: stationName,
      restaurants: restaurants.map(r => ({
        _id: r._id,
        name: r.name,
        address: r.address,
        city: r.city,
        phone: r.phone,
        rating: r.rating,
        distanceFromStation: r.distanceFromStation,
        minPreparationTime: r.minPreparationTime,
        paymentModes: r.paymentModes,
        operatingHours: r.operatingHours,
        breakTime: r.breakTime,
        station: r.station
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

