import { Request, Response } from "express";
import { storeData } from "../models/SensorData";
import pool from "../config/db";
import { logActivity } from "../services/activityLogsService";
import logger from "../services/loggingService";
import { formatTimestampForMySQL } from "../utils/dateUtils";

export const processSensorData = async (req: Request, res: Response) => {
  const { sensorId, equipmentId, timestamp, activity } = req.body;

  if (!sensorId || !equipmentId || typeof activity !== "boolean") {
    res.status(400).json({ message: "Missing or invalid sensor data fields" });
    return;
  }

  try {
    // Step 1: Store raw sensor data
    await storeData({ sensorId, equipmentId, timestamp, activity });

    // Step 2: Check current equipment status
    const [equipmentRows]: any = await pool.query(
      "SELECT status FROM equipment WHERE equipmentId = ?",
      [equipmentId]
    );

    if (equipmentRows.length === 0) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }

    const currentStatus = equipmentRows[0].status;
    const formattedTimestamp = formatTimestampForMySQL(timestamp);
    if (activity && currentStatus !== "in_use") {
      // Start usage session
      await pool.query(
        "INSERT INTO equipment_usage (equipmentId, startTime) VALUES (?, ?)",
        [equipmentId, formattedTimestamp]
      );
      // Update equipment status
      await pool.query(
        "UPDATE equipment SET status = 'in_use' WHERE equipmentId = ?",
        [equipmentId]
      );
      await logActivity(
        null,
        "Sensor Trigger - Start Usage",
        `Equipment ID ${equipmentId} started use at ${formattedTimestamp}`,
        req.ip as string
      );
    } else if (!activity && currentStatus === "in_use") {
      // End active usage session
      const [usageRows]: any = await pool.query(
        `SELECT usageId, startTime FROM equipment_usage WHERE equipmentId = ? AND endTime IS NULL`,
        [equipmentId]
      );

      if (usageRows.length > 0) {
        const { usageId, startTime } = usageRows[0];
        const durationSec = Math.floor(
          (new Date(formattedTimestamp).getTime() -
            new Date(startTime).getTime()) /
            1000
        );

        await pool.query(
          `UPDATE equipment_usage SET endTime = ?, durationSec = ? WHERE usageId = ?`,
          [formattedTimestamp, durationSec, usageId]
        );
      }
      // Update equipment status and usageCount
      await pool.query(
        `UPDATE equipment SET status = 'available', usageCount = usageCount + 1, lastUsedAt = ? WHERE equipmentId = ?`,
        [formattedTimestamp, equipmentId]
      );

      await logActivity(
        null,
        "Sensor Trigger - End Usage",
        `Equipment ID ${equipmentId} ended use at ${formattedTimestamp}`,
        req.ip as string
      );
    }

    res.status(201).json({ message: "Sensor data processed successfully" });
  } catch (error) {
    logger.error("Error processing sensor data", { error });
    res.status(500).json({ message: "Internal server error" });
  }
};
