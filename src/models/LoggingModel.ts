import pool from "../config/db";
import logger from "../services/loggingService";

// Fetch recent activity logs with user info
export const getActivityLogs = async (limit: number = 100) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        l.id,
        l.user_id,
        u.username,
        u.email,
        l.action,
        l.details,
        l.ip_address,
        l.created_at
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ?
    `, [limit]);

    return rows;
  } catch (error) {
    logger.error("Error fetching activity logs:", error);
    return [];
  }
};
