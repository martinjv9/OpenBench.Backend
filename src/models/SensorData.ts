import pool from "../config/db";

export interface SensorData {
  id?: number;
  equipmentId: string;
  sensorId: string;
  timestamp: string;
  activity: boolean;
  battery?: number;
}

export const saveSensorData = async (data: SensorData): Promise<void> => {
  const { equipmentId, sensorId, timestamp, activity, battery } = data;

  const query = `INSERT INTO sensor_data (equipmentId, sensorId, timestamp, activity, battery) VALUES (?, ?, ?, ?, ?)`;

  await pool.query(query, [
    data.sensorId,
    data.equipmentId,
    data.timestamp,
    data.activity,
    data.battery,
  ]);
};
