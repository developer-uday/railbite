import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";
import {
  createRestaurant,
  getVendorRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantMenu,
  addMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  getVendorOrders,
  getOrderDetails,
  updateOrderStatus,
  acknowledgeOrder,
  declineOrder,
  getStoreStatus,
  getRestaurantsByStation,
} from "../controllers/vendorController.js";

const router = express.Router();

// =================== RESTAURANT MANAGEMENT ===================

// Create restaurant
router.post(
  "/restaurants",
  authMiddleware,
  authorize("vendor"),
  createRestaurant
);

// Get all restaurants for vendor
router.get(
  "/restaurants",
  authMiddleware,
  authorize("vendor"),
  getVendorRestaurants
);

// Get vendor's primary restaurant
router.get(
  "/restaurant",
  authMiddleware,
  authorize("vendor"),
  getRestaurant
);

// Update restaurant
router.put(
  "/restaurants/:restaurantId",
  authMiddleware,
  authorize("vendor"),
  updateRestaurant
);

// Delete restaurant
router.delete(
  "/restaurants/:restaurantId",
  authMiddleware,
  authorize("vendor"),
  deleteRestaurant
);

// Get store status (open/close times, feasibility)
router.get(
  "/store-status",
  authMiddleware,
  authorize("vendor"),
  getStoreStatus
);

// =================== MENU MANAGEMENT ===================

// Get restaurant menu
router.get(
  "/restaurants/:restaurantId/menu",
  getRestaurantMenu
);

// Add menu item
router.post(
  "/restaurants/:restaurantId/menu",
  authMiddleware,
  authorize("vendor"),
  addMenuItem
);

// Update menu item
router.put(
  "/restaurants/:restaurantId/menu/:menuId",
  authMiddleware,
  authorize("vendor"),
  updateMenuItem
);

// Toggle menu item availability (enable/disable)
router.patch(
  "/restaurants/:restaurantId/menu/:menuId/availability",
  authMiddleware,
  authorize("vendor"),
  toggleMenuItemAvailability
);

// Delete menu item (soft delete - disables it)
router.delete(
  "/restaurants/:restaurantId/menu/:menuId",
  authMiddleware,
  authorize("vendor"),
  deleteMenuItem
);

// =================== ORDER MANAGEMENT ===================

// Get all vendor orders
router.get(
  "/orders",
  authMiddleware,
  authorize("vendor"),
  getVendorOrders
);

// Get order details
router.get(
  "/orders/:orderId",
  authMiddleware,
  authorize("vendor"),
  getOrderDetails
);

// Acknowledge order
router.patch(
  "/orders/:orderId/acknowledge",
  authMiddleware,
  authorize("vendor"),
  acknowledgeOrder
);

// Decline order
router.patch(
  "/orders/:orderId/decline",
  authMiddleware,
  authorize("vendor"),
  declineOrder
);

// Update order status
router.patch(
  "/orders/:orderId/status",
  authMiddleware,
  authorize("vendor"),
  updateOrderStatus
);

// =================== USER ROUTES (NO AUTH REQUIRED) ===================

// Get restaurants by station (for users)
router.get(
  "/restaurants/station/:stationName",
  getRestaurantsByStation
);

export default router;
