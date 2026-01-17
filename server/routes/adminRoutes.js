import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  deactivateUser,
  activateUser,
  getSystemStats,
  getOrderStats,
  approveRestaurant,
  rejectRestaurant,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", authMiddleware, authorize("admin"), getAllUsers);
router.put("/users/:userId/deactivate", authMiddleware, authorize("admin"), deactivateUser);
router.put("/users/:userId/activate", authMiddleware, authorize("admin"), activateUser);
router.get("/stats", authMiddleware, authorize("admin"), getSystemStats);
router.get("/order-stats", authMiddleware, authorize("admin"), getOrderStats);
router.put("/restaurants/:restaurantId/approve", authMiddleware, authorize("admin"), approveRestaurant);
router.put("/restaurants/:restaurantId/reject", authMiddleware, authorize("admin"), rejectRestaurant);

export default router;
