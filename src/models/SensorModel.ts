import pool from "../config/db";
import logger from "../services/loggingService";

export const getSensorInfo = async () => {
  try {
    const [rows]: any = await pool.query(`
      SELECT sensorId, equipmentId, type, batteryLevel, lastPing
      FROM sensor
    `);
    return rows;
  } catch (error) {
    logger.error("Error fetching sensor info:", error);
    return [];
  }
};
