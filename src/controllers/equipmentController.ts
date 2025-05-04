import { Request, Response } from "express";
import logger from "../services/loggingService";
import * as EquipmentModel from "../models/EquipmentModel";
import { handleError } from "../services/errorHandler";
import { logActivity } from "../services/activityLogsService";
import pool from "../config/db";

// Create new equipment
export const createEquipment = async (req: Request, res: Response) => {
  const { name, location, type } = req.body;

  if (!name || !location || !type) {
    res.status(400).json({ message: "Name, location, and type are required" });
    return;
  }

  try {
    const equipmentId = await EquipmentModel.createEquipment(
      name,
      location,
      type
    );
    await logActivity(
      req.user?.id || null,
      "Create Equipment",
      `Equipment "${name}" created with type "${type}" at location "${location}"`,
      req.ip as string
    );
    logger.info(`Equipment created: ${name}`);
    res
      .status(201)
      .json({ message: "Equipment created successfully", equipmentId });
  } catch (error) {
    handleError(res, error, "Error creating equipment");
    return;
  }
};

// Get all equipment
export const getEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await EquipmentModel.getEquipment();
    res.status(200).json(equipment);
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};

// Get equipment by status
export const getEquipmentByStatusController = async (
  req: Request,
  res: Response
) => {
  const { filter } = req.query;

  const allowedStatuses = ["available", "in_use", "faulty"];
  if (
    !filter ||
    typeof filter !== "string" ||
    !allowedStatuses.includes(filter)
  ) {
    res.status(400).json({ message: "Invalid or missing filter parameter" });
    return;
  }

  try {
    const equipment = await EquipmentModel.getEquipmentByStatus(filter);
    res.status(200).json(equipment);
  } catch (error) {
    handleError(res, error, "Error fetching equipment by status");
    return;
  }
};

// Get equipment usage summary
export const getEquipmentUsageSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const summary = await EquipmentModel.getEquipmentUsageSummary();
    res.status(200).json(summary);
  } catch (error) {
    handleError(res, error, "Error fetching equipment usage summary");
    return;
  }
};

// Update equipment
export const updateEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, location, type, status } = req.body;

  try {
    const result = await EquipmentModel.updateEquipment(Number(id), {
      name,
      location,
      type,
      status,
    });

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }

    await logActivity(
      req.user?.id || null,
      "Update Equipment",
      `Equipment ID ${id} updated`,
      req.ip as string
    );

    logger.info(`Equipment updated: ID ${id}`);
    res.status(200).json({ message: "Equipment updated successfully" });
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};

// Delete equipment
export const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await EquipmentModel.deleteEquipment(Number(id));

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }

    await logActivity(
      req.user?.id || null,
      "Delete Equipment",
      `Equipment ID ${id} deleted`,
      req.ip as string
    );

    logger.info(`Equipment deleted: ID ${id}`);
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};

export const getEquipmentActive = async (req: Request, res: Response) => {
  try {
    const active: any = await pool.query(
      "SELECT COUNT(*) AS count FROM equipmenttest WHERE in_use ='1'"
    );

    res.json({
      active: active[0]?.count || 0,
    });
  } catch (err) {
    console.error("Error fetching equipment summary:", err);
    res.status(500).json({ error: "Internal server error, TACTO1" });
  }
};

// Refactor to use EquipmentModel instead, not interacting with the database directly
export const getEquipmentMap = async (req: Request, res: Response) => {
  try {
    const [results]: any = await pool.query(`
        SELECT equipmentId AS equipment_id, name AS equipment_name, status AS in_use, updatedAt AS last_updated
        FROM equipment
      `);

    res.json(results);
  } catch (error) {
    console.error("Error fetching equipment map:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEquipmentMapData = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
        SELECT 
          equipment_id,
          equipment_name,
          in_use,
          sensor_id,
          battery,
          updated_at AS last_updated
        FROM equipmenttest
      `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching equipment map data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEquipmentStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await EquipmentModel.getEquipmentStats();
    res.status(200).json(stats);
  } catch (error) {
    handleError(res, error, "Error fetching equipment stats");
  }
};

export const getEquipmentInfoController = async (req: Request, res: Response) => {
  try {
    const info = await EquipmentModel.getEquipment(); // Reuses getEquipment()
    const formatted = info.map((e: any) => ({
      equipmentId: e.equipmentId,
      name: e.name,
      type: e.type,
      location: e.location
    }));
    res.status(200).json(formatted);
  } catch (error) {
    handleError(res, error, "Error fetching equipment info");
  }
};