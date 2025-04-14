import pool from "../config/db";
import logger from "./loggingService";

export const logActivity = async (
  userId: number | null,
  action: string,
  details: string,
  ipAddress: string
) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`,
      [userId, action, details, ipAddress]
    );

    logger.info(`Activity logged: ${action} - ${details}`);
  } catch (error) {
    logger.error("Failed to log activity", { error });
  }
};
