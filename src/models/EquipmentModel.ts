import pool from "../config/db";
import logger from "../services/loggingService";
import { Request, Response } from "express";

export const createEquipment = async (
  name: string,
  location: string,
  type: string
) => {
  try {
    const [result]: any = await pool.query(
      "INSERT INTO equipment (name, location, type) VALUES (?, ? , ?)",
      [name, location, type]
    );
    return result.insertId;
  } catch (error) {
    logger.error("Error creating equipment:", error);
    return null;
  }
};

export const getEquipment = async () => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM equipment");

    return rows;
  } catch (error) {
    logger.error("Error fetching equipment:", error);
    return [];
  }
};

export const updateEquipment = async (
  id: number,
  fields: { name?: string; location?: string; type?: string; status?: string }
) => {
  const updates: string[] = [];
  const values: any[] = [];

  if (fields.name) {
    updates.push("name = ?");
    values.push(fields.name);
  }
  if (fields.location) {
    updates.push("location = ?");
    values.push(fields.location);
  }
  if (fields.type) {
    updates.push("type = ?");
    values.push(fields.type);
  }
  if (fields.status !== undefined) {
    updates.push("status = ?");
    values.push(fields.status);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `UPDATE equipment SET ${updates.join(
    ", "
  )} WHERE equipmentId = ?`;

  const [result]: any = await pool.query(query, values);
  return result;
};

export const deleteEquipment = async (id: number) => {
  const [result]: any = await pool.query(
    `DELETE FROM equipment WHERE equipmentId = ?`,
    [id]
  );
  return result;
};
