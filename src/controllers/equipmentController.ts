import { Request, Response } from "express";
import pool from "../config/db";

export const getEquipmentSummary = async (req: Request, res: Response) => {
    try {
        const [total]: any = await pool.query("SELECT COUNT(*) AS count FROM equipment");
        const [active]: any = await pool.query("SELECT COUNT(*) AS count FROM equipment WHERE status = 'active'");
        const [inactive]: any = await pool.query("SELECT COUNT(*) AS count FROM equipment WHERE status = 'inactive'");

        res.json({
            total: total[0]?.count || 0,
            active: active[0]?.count || 0,
            inactive: inactive[0]?.count || 0,
        });
    } catch (err) {
        console.error("Error fetching equipment summary:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
