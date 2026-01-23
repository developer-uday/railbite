import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUser,
  deactivateUser,
  activateUser,
  deleteUser,
  getSystemStats,
  getOrderStats,
  getAllVendors,
  getVendor,
  suspendVendor,
  approveVendor,
  rejectVendor,
  deleteVendor,
  getAllRestaurants,
  getRestaurant,
  approveRestaurant,
  rejectRestaurant,
  deleteRestaurant,
  getAllOrders,
  getOrder,
  cancelOrder,
  updateOrder,
  searchUsers,
  searchVendors,
  searchRestaurants,
  createManager,
  getAllManagers,
  getManager,
  updateManager,
  deleteManager,
} from "../controllers/adminController.js";

const router = express.Router();

// Stats
router.get("/stats", authMiddleware, authorize("admin", "manager"), getSystemStats);
router.get("/order-stats", authMiddleware, authorize("admin", "manager"), getOrderStats);

// Users
router.get("/users", authMiddleware, authorize("admin", "manager"), getAllUsers);
router.get("/users/search", authMiddleware, authorize("admin", "manager"), searchUsers);
router.get("/users/:userId", authMiddleware, authorize("admin", "manager"), getUser);
router.put("/users/:userId/deactivate", authMiddleware, authorize("admin", "manager"), deactivateUser);
router.put("/users/:userId/activate", authMiddleware, authorize("admin", "manager"), activateUser);
router.delete("/users/:userId", authMiddleware, authorize("admin", "manager"), deleteUser);

// Vendors
router.get("/vendors", authMiddleware, authorize("admin", "manager"), getAllVendors);
router.get("/vendors/search", authMiddleware, authorize("admin", "manager"), searchVendors);
router.get("/vendors/:vendorId", authMiddleware, authorize("admin", "manager"), getVendor);
router.put("/vendors/:vendorId/suspend", authMiddleware, authorize("admin", "manager"), suspendVendor);
router.put("/vendors/:vendorId/approve", authMiddleware, authorize("admin", "manager"), approveVendor);
router.put("/vendors/:vendorId/reject", authMiddleware, authorize("admin", "manager"), rejectVendor);
router.delete("/vendors/:vendorId", authMiddleware, authorize("admin", "manager"), deleteVendor);

// Restaurants
router.get("/restaurants", authMiddleware, authorize("admin", "manager"), getAllRestaurants);
router.get("/restaurants/search", authMiddleware, authorize("admin", "manager"), searchRestaurants);
router.get("/restaurants/:restaurantId", authMiddleware, authorize("admin", "manager"), getRestaurant);
router.put("/restaurants/:restaurantId/approve", authMiddleware, authorize("admin", "manager"), approveRestaurant);
router.put("/restaurants/:restaurantId/reject", authMiddleware, authorize("admin", "manager"), rejectRestaurant);
router.delete("/restaurants/:restaurantId", authMiddleware, authorize("admin", "manager"), deleteRestaurant);

// Orders
router.get("/orders", authMiddleware, authorize("admin", "manager"), getAllOrders);
router.get("/orders/:orderId", authMiddleware, authorize("admin", "manager"), getOrder);
router.put("/orders/:orderId", authMiddleware, authorize("admin", "manager"), updateOrder);
router.put("/orders/:orderId/cancel", authMiddleware, authorize("admin", "manager"), cancelOrder);

// Managers
router.post("/managers", authMiddleware, authorize("admin"), createManager);
router.get("/managers", authMiddleware, authorize("admin"), getAllManagers);
router.get("/managers/:managerId", authMiddleware, authorize("admin"), getManager);
router.put("/managers/:managerId", authMiddleware, authorize("admin"), updateManager);
router.delete("/managers/:managerId", authMiddleware, authorize("admin"), deleteManager);

export default router;
