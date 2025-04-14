import { Request, Response } from "express";
import logger from "../services/loggingService";
import * as EquipmentModel from "../models/EquipmentModel";
import { handleError } from "../services/errorHandler";

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
    logger.info(`Equipment created: ${name}`);
    res
      .status(201)
      .json({ message: "Equipment created successfully", equipmentId });
  } catch (error) {
    handleError(res, error, "Error creating equipment");
    return;
  }
};

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await EquipmentModel.getEquipment();
    res.status(200).json(equipment);
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};

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

    logger.info(`Equipment updated: ID ${id}`);
    res.status(200).json({ message: "Equipment updated successfully" });
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await EquipmentModel.deleteEquipment(Number(id));

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Equipment not found" });
      return;
    }

    logger.info(`Equipment deleted: ID ${id}`);
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    handleError(res, error, "Internal server error");
    return;
  }
};
