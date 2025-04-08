import express from "express";
import { receivedSensorData } from "../controllers/sensorController";
import { authenticateToken } from "../middlewares/authMiddleware";
import pool from "../config/db";

const router = express.Router();

router.post("/data", receivedSensorData);

router.get("/status", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, sensor_id, equipment_id, datetime, in_use, battery FROM sensor_data ORDER BY datetime DESC LIMIT 20"
        );
        res.json(rows);
    } catch (err) {
        console.error("Failed to fetch sensor status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
