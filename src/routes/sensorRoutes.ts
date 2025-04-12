import express from "express";
import { postSensorData } from "../controllers/sensorController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import pool from "../config/db";

const router = express.Router();

router.post("/data", postSensorData);

router.get(
  "/status",
  authenticateToken,
  authorizeRoles("technician", "admin"),
  // Refactor code below into a controller function
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, sensor_id, equipment_id, datetime, in_use, battery FROM sensor_data ORDER BY datetime DESC LIMIT 20"
      );
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch sensor status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
