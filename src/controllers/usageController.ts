import { Request, Response } from "express";
import pool from "../config/db";

export const startUsage = async (req: Request, res: Response) => {
  const { equipmentId } = req.body;

  try {
    // Insert new usage session
    const [result]: any = await pool.query(
      `INSERT INTO equipment_usage (equipmentId, startTime) VALUES (?, NOW())`,
      [equipmentId]
    );

    // Update equipment status to 'in_use'
    await pool.query(
      `UPDATE equipment SET status = 'in_use' WHERE equipmentId = ?`,
      [equipmentId]
    );

    res.status(201).json({
      message: "Usage session started",
      usageId: result.insertId,
    });
  } catch (error) {
    console.error("Error starting usage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const endUsage = async (req: Request, res: Response) => {
  const { equipmentId } = req.body;

  try {
    // Step 1: Find open session for equipment
    const [rows]: any = await pool.query(
      `SELECT usageId, startTime FROM equipment_usage WHERE equipmentId = ? AND endTime IS NULL`,
      [equipmentId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No active usage session found for this equipment." });
    }

    const { usageId, startTime } = rows[0];
    const endTime = new Date();
    const durationSec = Math.floor(
      (endTime.getTime() - new Date(startTime).getTime()) / 1000
    );

    // Step 2: Close the session
    await pool.query(
      `UPDATE equipment_usage SET endTime = NOW(), durationSec = ? WHERE usageId = ?`,
      [durationSec, usageId]
    );

    // Step 3: Update equipment status
    await pool.query(
      `UPDATE equipment SET status = 'available', usageCount = usageCount + 1, lastUsedAt = NOW() WHERE equipmentId = ?`,
      [equipmentId]
    );

    res.status(200).json({
      message: "Usage session ended",
      usageId,
      durationSec,
    });
  } catch (error) {
    console.error("Error ending usage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
