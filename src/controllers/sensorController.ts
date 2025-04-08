/*import { Request, Response } from "express";

export const receivedSensorData = (req: Request, res: Response) => {
  try {
    const { sensorId, equipmentId, datetime, inUse } = req.body;
    console.log(`Connection received from Sensor: ${sensorId}`);
    console.log(
      `Data: equipmentId: ${equipmentId}, datetime: ${datetime}, inUse: ${inUse}`
    );

    res.status(200).json({ message: "Data received successfully" });
    return;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("Signal failed to receive", err);
    }
  }
};

export default receivedSensorData;
*/

import { Request, Response } from "express";
import { storeData } from "../models/SensorData";

export const receivedSensorData = async (req: Request, res: Response) => {
  try {
    const { sensorId, equipmentId, datetime, inUse, battery } = req.body;

    console.log(`Connection received from Sensor: ${sensorId}`);
    console.log(`Data: equipmentId: ${equipmentId}, datetime: ${datetime}, inUse: ${inUse}`);

    // Save data to DB
    await storeData({
      sensorId,
      equipmentId,
      timestamp: datetime,
      activity: inUse === 1, // convert to boolean
      battery,
    });

    res.status(200).json({ message: "Sensor data received and stored." });
  } catch (err) {
    console.error("❌ Error storing sensor data:", err);
    res.status(500).json({ message: "Failed to process sensor data" });
  }
};

export default receivedSensorData;

