import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserProfile, updateUserProfile, getAllUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserById);

export default router;
