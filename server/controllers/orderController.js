import Order from "../models/Order.js";
import Menu from "../models/Menu.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

/* ===================== CREATE ORDER ===================== */

export const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, customer, journey, pricing, paymentMethod, notes } = req.body;

    if (!restaurantId || !items || !customer || !pricing) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: restaurantId, items, customer, pricing" 
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order must have at least one item" 
      });
    }

    // Check if user is active (if user is authenticated)
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(403).json({ 
          success: false,
          message: "Your account has been deactivated. You cannot place orders." 
        });
      }
    }

    // Check if restaurant/vendor is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ 
        success: false,
        message: "Restaurant not found" 
      });
    }

    if (!restaurant.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "This restaurant is not currently accepting orders" 
      });
    }

    // Check if vendor is active
    const vendor = await User.findById(restaurant.vendor);
    if (!vendor || !vendor.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "This restaurant's vendor is not active. Orders cannot be placed." 
      });
    }

    // Basic contact validation
    if (!customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone are required' });
    }
    if (!journey.pnr) {
      return res.status(400).json({ success: false, message: 'Journey PNR is required' });
    }
     // Resolve menu items from DB to ensure accurate name/price
    const itemIds = items.map(i => i.itemId).filter(Boolean);
    const menus = await Menu.find({ _id: { $in: itemIds } });
    const menuMap = new Map(menus.map(m => [String(m._id), m]));

    const validatedItems = [];
    for (const item of items) {
      if (!item.itemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid item data: missing itemId or invalid quantity' });
      }

      const menuDoc = menuMap.get(String(item.itemId));
      if (!menuDoc) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${item.itemId}` });
      }

      validatedItems.push({
        itemId: menuDoc._id,
        name: menuDoc.name || 'Unknown Item',
        price: typeof menuDoc.price === 'number' ? menuDoc.price : (item.price || 0),
        quantity: item.quantity,
      });
    }

    // Compute totals server-side
    const subtotal = validatedItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
    const deliveryFee = (pricing && typeof pricing.deliveryFee === 'number') ? pricing.deliveryFee : 20;
    const tax = (pricing && typeof pricing.tax === 'number') ? pricing.tax : 0;
    const discount = (pricing && typeof pricing.discount === 'number') ? pricing.discount : 0;
    const total = subtotal + deliveryFee + tax - discount;

    const order = await Order.create({
      user: req.user?.id,
      restaurant: restaurantId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      journey: {
        trainNo: journey?.trainNo,
        doj: journey?.doj,
        pnr: journey?.pnr,
        seat: journey?.seat,
        coach: journey?.coach,
        station: journey?.station,
      },
      items: validatedItems,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
      },
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'PREPAID' ? 'PAID' : 'PENDING',
      notes: notes,
      deliveryDate: req.body.deliveryDate,
      deliveryTime: req.body.deliveryTime,
      orderStatus: 'NEW',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        _id: order._id,
        total: order.pricing.total,
      },
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

/* ===================== USER ORDERS ===================== */

export const getUserOrders = async (req, res) => {
  try {
    // Users see ALL their orders
    const orders = await Order.find({ 
      user: req.user.id
    })
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent orders for the authenticated user (optional ?limit=5)
export const getRecentUserOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    // Users see ALL their recent orders
    const orders = await Order.find({ 
      user: req.user.id
    })
      .select("orderId orderStatus paymentStatus paymentMethod pricing.total createdAt items restaurant journey")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Map to lightweight shape for client including an items preview
    const response = orders.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      journey: o.journey,
      total: o.pricing?.total || 0,
      itemCount: Array.isArray(o.items) ? o.items.length : 0,
      itemsPreview: Array.isArray(o.items) ? o.items.slice(0,2).map(it => it.name).filter(Boolean) : [],
      restaurant: o.restaurant,
      createdAt: o.createdAt,
    }));

    res.json({ success: true, orders: response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("restaurant")
      .populate("items.itemId");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Admin can only accept NEW orders (change to ACCEPTED)
    // or cancel/mark undelivered at any point
    const allowedStatuses = ["ACCEPTED", "CANCELLED", "UNDELIVERED"];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Admin can only set: ACCEPTED, CANCELLED, UNDELIVERED" 
      });
    }

    // If accepting, order must be in NEW status
    if (status === "ACCEPTED" && order.orderStatus !== "NEW") {
      return res.status(400).json({ 
        message: "Can only accept orders with NEW status" 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, user: req.user.id },
      {
        status: "cancelled",
        paymentStatus: "refunded",
      },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Vendors only see: ACCEPTED, CANCELLED, UNDELIVERED
    // (NOT NEW or PENDING - those are admin-only)
    const allowedStatuses = ["ACCEPTED", "CANCELLED", "UNDELIVERED"];
    
    const orders = await Order.find({ 
      restaurant: restaurantId,
      orderStatus: { $in: allowedStatuses }
    })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
