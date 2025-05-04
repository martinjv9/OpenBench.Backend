import pool from "../config/db";
import logger from "../services/loggingService";

// Create new equipment
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

// Get all equipment
export const getEquipment = async () => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM equipment");

    return rows;
  } catch (error) {
    logger.error("Error fetching equipment:", error);
    return [];
  }
};

// Get equipment by status
export const getEquipmentByStatus = async (status: string) => {
  const [rows]: any = await pool.query(
    `SELECT * FROM equipment WHERE status = ?`,
    [status]
  );
  return rows;
};

// Get equipment usage summary
export const getEquipmentUsageSummary = async () => {
  const [rows]: any = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM equipment
      GROUP BY status
    `);

  // Transform to key-value pairs
  const summary: Record<string, number> = {
    available: 0,
    in_use: 0,
    faulty: 0,
  };

  rows.forEach((row: any) => {
    summary[row.status] = row.count;
  });

  return summary;
};

// Update equipment details
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

// Delete equipment using ID
export const deleteEquipment = async (id: number) => {
  const [result]: any = await pool.query(
    `DELETE FROM equipment WHERE equipmentId = ?`,
    [id]
  );
  return result;
};

export const getEquipmentStats = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      e.equipmentId,
      e.name,
      e.usageCount,
      COALESCE(SUM(u.durationSec), 0) AS usageDuration
    FROM equipment e
    LEFT JOIN equipment_usage u ON e.equipmentId = u.equipmentId
    GROUP BY e.equipmentId, e.name, e.usageCount
  `);
  return rows;
};