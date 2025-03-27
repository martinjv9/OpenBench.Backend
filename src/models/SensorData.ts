import pool from "../config/db";

export interface SensorData {
    id?: number;
    sensorId: number;
    equipmentId: string;
    timestamp: string;
    activity: boolean;
    battery?: number;
}

export const storeData = async (data: SensorData): Promise<void> => {
    const { equipmentId, sensorId, timestamp, activity, battery } = data;

    const query = "INSERT INTO sensor_data (sensorId, equipmentId, timestamp, activity, battery) VALUES (?, ?, ?, ?, ?)";

    await pool.query(query,
        [
            data.sensorId,
            data.equipmentId,
            data.timestamp,
            data.activity,
            data.battery
        ]
    );
};


