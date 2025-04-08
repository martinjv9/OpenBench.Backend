import pool from "../config/db";
import logger from "../services/loggingService";

export interface EquipmentData {
    id?: number;
    sensorId: number;
    equipmentId: string;
    timestamp: string;
    activity: boolean;
    battery?: number;
}


// TODO:
// Edit this file to work with Equipment
export const storeData = async (data: EquipmentData): Promise<void> => {
    try {
        const { equipmentId, sensorId, timestamp, activity, battery } = data;

        // ✅ Input validation
        if (
            typeof sensorId !== 'number' ||
            typeof equipmentId !== 'string' ||
            typeof timestamp !== 'string' ||
            typeof activity !== 'boolean'
        ) {
            logger.error("Invalid sensor data format", { data });
            throw new Error("Invalid sensor data format");
        }

        const query = `
      INSERT INTO equpment 
      (sensorId, equipmentId, timestamp, activity, battery) 
      VALUES (?, ?, ?, ?, ?)
    `;

        await pool.query(query, [
            sensorId,
            equipmentId,
            timestamp,
            activity,
            battery ?? null,
        ]);

        logger.info("Sensor data successfully stored", { sensorId, equipmentId, timestamp });

    } catch (error) {
        logger.error("❌ Failed to store sensor data", {
            input: data,
            error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("Database insert failed: " + (error instanceof Error ? error.message : String(error)));
    }
};


// access matrix
// roles rows
// columns permmisions
// 