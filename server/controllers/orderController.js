import Order from "../models/Order.js";
import Menu from "../models/Menu.js";

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

    // Basic contact validation
    if (!customer.name || !customer.email) {
      return res.status(400).json({ success: false, message: 'Customer name and email are required' });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customer.email)) {
      return res.status(400).json({ success: false, message: 'Invalid customer email' });
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
    const orders = await Order.find({ user: req.user.id })
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
    const orders = await Order.find({ user: req.user.id })
      .select("orderId orderStatus paymentStatus pricing.total createdAt items restaurant")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Map to lightweight shape for client including an items preview
    const response = orders.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
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

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });
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

    const orders = await Order.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
