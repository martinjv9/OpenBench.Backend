import { Request, Response } from "express";
import { storeData } from "../models/SensorData";
import pool from "../config/db";
import { logActivity } from "../services/activityLogsService";
import logger from "../services/loggingService";
import { formatTimestampForMySQL } from "../utils/dateUtils";
import { io } from "../server";
import { getSensorInfo } from "../models/SensorModel";
import { handleError } from "../services/errorHandler";

export const processSensorData = async (req: Request, res: Response) => {
  let { sensorId, equipmentId, timestamp, activity } = req.body;

  equipmentId = Number(equipmentId);

  if (!sensorId || !equipmentId || typeof activity !== "boolean") {
    res.status(400).json({ message: "Missing or invalid sensor data fields" });
    return;
  }

  try {
    // Step 1: Store raw sensor data
    await storeData({ sensorId, equipmentId, timestamp, activity });
    // logger.info("✅ Step 1 complete: Sensor data stored");

    // Step 2: Check current equipment status
    const [equipmentRows]: any = await pool.query(
      "SELECT status FROM equipment WHERE equipmentId = ?",
      [equipmentId]
    );
    // logger.info("✅ Step 2 complete: Fetched equipment status");

    if (equipmentRows.length === 0) {
      res.status(404).json({ message: "Equipment not found" });
      // logger.info("✅ Step 3 complete: Equipment not found");

      return;
    }

    const currentStatus = equipmentRows[0].status;
    const formattedTimestamp = timestamp
      ? formatTimestampForMySQL(timestamp)
      : new Date().toISOString().slice(0, 19).replace("T", " ");
    if (activity && currentStatus !== "in_use") {
      // logger.info("✅ Step 4 Starting usage session");
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
      // logger.info("✅ Step 5: Inserted usage session");

      await logActivity(
        null,
        "Sensor Trigger - Start Usage",
        `Equipment ID ${equipmentId} started use at ${formattedTimestamp}`,
        req.ip as string
      );
      // logger.info("✅ Step 6: Logged activity");
    } else if (!activity && currentStatus === "in_use") {
      console.log("Ending usage session");
      // End active usage session
      const [usageRows]: any = await pool.query(
        `SELECT usageId, startTime FROM equipment_usage WHERE equipmentId = ? AND endTime IS NULL`,
        [equipmentId]
      );
      // logger.info("✅ Step 7: Fetched active usage session");

      if (usageRows.length > 0) {
        const { usageId, startTime } = usageRows[0];
        const durationSec = Math.floor(
          (new Date(formattedTimestamp).getTime() -
            new Date(startTime).getTime()) /
            1000
        );
        // logger.info("✅ Step 8: Calculated duration");

        await pool.query(
          `UPDATE equipment_usage SET endTime = ?, durationSec = ? WHERE usageId = ?`,
          [formattedTimestamp, durationSec, usageId]
        );
        // logger.info("✅ Step 9: Updated usage session");
      }
      // Update equipment status and usageCount
      await pool.query(
        `UPDATE equipment SET status = 'available', usageCount = usageCount + 1, lastUsedAt = ? WHERE equipmentId = ?`,
        [formattedTimestamp, equipmentId]
      );
      // logger.info("✅ Step 10: Updated equipment status");

      await logActivity(
        null,
        "Sensor Trigger - End Usage",
        `Equipment ID ${equipmentId} ended use at ${formattedTimestamp}`,
        req.ip as string
      );
      // logger.info("✅ Step 11: Logged activity");
    }

    io.emit("statusUpdate", {
      equipmentId,
      inUse: activity,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ message: "Sensor data processed successfully" });
  } catch (error: any) {
    logger.error("Error processing sensor data", {
      message: error?.message,
      stack: error?.stack,
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSensorInfoController = async (req: Request, res: Response) => {
  try {
    const info = await getSensorInfo();
    res.status(200).json(info);
  } catch (error) {
    handleError(res, error, "Error fetching sensor info");
  }
};