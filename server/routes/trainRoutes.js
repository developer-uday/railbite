import express from "express";
import { checkTrain } from "../controllers/trainController.js";

const router = express.Router();

router.get("/:trainNo", checkTrain);

export default router;
