import { Request, Response } from "express";
import pool from "../config/db";
import logger from "../services/loggingService";

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const [equipmentRows]: any = await pool.query("SELECT COUNT(*) AS count FROM equipmenttest");
        const [sensorRows]: any = await pool.query("SELECT COUNT(DISTINCT sensor_id) AS count FROM sensor_data");
        const [activeRows]: any = await pool.query("SELECT COUNT(DISTINCT sensor_id) AS count FROM sensor_data WHERE in_use = 1");
        logger.info("Dashboard summary data fetched successfully");

        const equipmentCount = equipmentRows[0]?.count || 0;
        const sensorCount = sensorRows[0]?.count || 0;
        const activeSensors = activeRows[0]?.count || 0;
        logger.info("Equipment count:", equipmentCount);
        logger.info("Sensor count:", sensorCount);
        logger.info("Active sensors count:", activeSensors);

        const [equipmentUsage]: any = await pool.query(`
      SELECT 
        equipment_name,
        COUNT(*) AS total,
        SUM(CASE WHEN in_use = 1 THEN 1 ELSE 0 END) AS in_use
      FROM equipmenttest
      GROUP BY equipment_name
      ORDER BY equipment_name;
    `);

        logger.info("Equipment usage data fetched successfully");

        const totalInUse = equipmentUsage.reduce((acc: number, curr: any) => acc + parseInt(curr.in_use), 0);
        const totalAvailable = equipmentUsage.reduce((acc: number, curr: any) => acc + parseInt(curr.total), 0);
        const usageRate = totalAvailable > 0 ? (totalInUse / totalAvailable) * 100 : 0;
        logger.info("Usage rate calculated successfully");

        res.json({ equipmentCount, sensorCount, activeSensors, equipmentUsage, usageRate });
    } catch (error) {
        console.error("Error getting dashboard summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
