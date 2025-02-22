import { Request, Response } from "express";

export const receivedSensorData = (req: Request, res: Response) => {
  try {
    // sensorNode -> {sensorId, equipmentId, datetime, inUse: 1)  - In use
    // sensorNode -> {sensorId, equipmentId, datetime, inUse: 0)  - Not in use
    // sensorNode -> {sensorId, equipmentId, datetime, inUse: 1)  - In use

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
