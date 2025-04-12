import pool from "../config/db";
import logger from "../services/loggingService";

export interface SensorData {
  id?: number;
  sensorId: number;
  equipmentId: string;
  timestamp: string;
  activity: boolean;
}

export const storeData = async (data: SensorData): Promise<void> => {
  try {
    const { equipmentId, sensorId, activity } = data;

    // ✅ Input validation
    if (
      typeof sensorId !== "number" ||
      typeof equipmentId !== "string" ||
      typeof activity !== "boolean"
    ) {
      logger.error("Invalid sensor data format", { data });
      throw new Error("Invalid sensor data format");
    }

    const query = `
      INSERT INTO sensor_data 
      (sensor_id, equipment_id, datetime, in_use) 
      VALUES (?, ?, NOW(), ?)
    `;

    await pool.query(query, [sensorId, equipmentId, activity]);

    logger.info("Sensor data successfully stored", {
      sensorId,
      equipmentId,
    });
  } catch (error) {
    logger.error("❌ Failed to store sensor data", {
      input: data,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      "Database insert failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export const startUsageSession = async (equipmentId: string): Promise<void> => {
  const [activeSession]: any = await pool.query(
    `SELECT * FROM equipment_usage WHERE equipmentId = ? AND endTime IS NULL`,
    [equipmentId]
  );

  if (activeSession.length === 0) {
    await pool.query(
      `INSERT INTO equipment_usage (equipmentId, startTime) VALUES (?, NOW())`,
      [equipmentId]
    );

    await pool.query(
      `UPDATE equipment SET status = 'in_use' WHERE equipmentId = ?`,
      [equipmentId]
    );

    logger.info(`Started usage session for equipment ${equipmentId}`);
  } else {
    logger.warn(
      `Attempted to start session, but session already active for equipment ${equipmentId}`
    );
  }
};

export const endUsageSession = async (equipmentId: string): Promise<void> => {
  const [openSession]: any = await pool.query(
    `SELECT usageId, startTime FROM equipment_usage WHERE equipmentId = ? AND endTime IS NULL`,
    [equipmentId]
  );

  if (openSession.length > 0) {
    const { usageId, startTime } = openSession[0];
    const durationSec = Math.floor(
      (new Date().getTime() - new Date(startTime).getTime()) / 1000
    );

    await pool.query(
      `UPDATE equipment_usage SET endTime = NOW(), durationSec = ? WHERE usageId = ?`,
      [durationSec, usageId]
    );

    await pool.query(
      `UPDATE equipment SET status = 'available', usageCount = usageCount + 1, lastUsedAt = NOW() WHERE equipmentId = ?`,
      [equipmentId]
    );

    logger.info(`Ended usage session for equipment ${equipmentId}`);
  } else {
    logger.warn(
      `Attempted to end session, but no active session found for equipment ${equipmentId}`
    );
  }
};
