import { Request, Response } from "express";
import {
  storeData,
  startUsageSession,
  endUsageSession,
} from "../models/SensorData";

export const postSensorData = async (req: Request, res: Response) => {
  const { sensorId, equipmentId, timestamp, activity } = req.body;

  try {
    // Store the sensor data
    await storeData({ sensorId, equipmentId, timestamp, activity });

    // Automate session management
    if (activity === true) {
      await startUsageSession(equipmentId);
    } else if (activity === false) {
      await endUsageSession(equipmentId);
    }

    res.status(200).json({ message: "Sensor data processed successfully" });
  } catch (error) {
    console.error("Error processing sensor data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
