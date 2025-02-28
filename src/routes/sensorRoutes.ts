import express from "express";
import { receivedSensorData } from "../controllers/sensorController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/data", authenticateToken, receivedSensorData); // ✅ Protected route

export default router;
