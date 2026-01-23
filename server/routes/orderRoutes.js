import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getRecentUserOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authMiddleware, authorize("user"), createOrder);
router.get("/recent", authMiddleware, authorize("user"), getRecentUserOrders);
router.get("/", authMiddleware, authorize("user"), getUserOrders);
router.get("/:orderId", authMiddleware, getOrderDetails);
router.put("/:orderId/status", authMiddleware, updateOrderStatus);
router.put("/:orderId/cancel", authMiddleware, authorize("user"), cancelOrder);
router.get("/restaurant/:restaurantId/orders", authMiddleware, authorize("vendor"), getRestaurantOrders);

export default router;
