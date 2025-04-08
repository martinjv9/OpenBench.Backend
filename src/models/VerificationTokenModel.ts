import pool from "../config/db";
import logger from "../services/loggingService";

export interface VerificationToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

export const createVerificationToken = async (
  data: VerificationToken
): Promise<void> => {
  try {
    const sql = `
      INSERT INTO email_verification_tokens (userId, token, expiresAt)
        VALUES (?, ?, ?)
    `;

    const params = [data.userId, data.token, data.expiresAt];
    await pool.execute(sql, params);
  } catch (error) {
    logger.error("❌ Failed to store sensor data", {
      input: data,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      "Database insert failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export const findVerificationToken = async (
  token: string
): Promise<VerificationToken | null> => {
  try {
    const sql = `
        SELECT * FROM email_verification_tokens 
        WHERE token = ? 
        LIMIT 1
      `;
    const [rows]: any = await pool.execute(sql, [token]);

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0] as VerificationToken;
  } catch (error) {
    logger.error("❌ Database Error in findVerificationToken:", {
      token,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      "Database query failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export const deleteVerificationToken = async (token: string): Promise<void> => {
  try {
    const sql = `
        DELETE FROM email_verification_tokens 
        WHERE token = ?
      `;
    await pool.execute(sql, [token]);
    logger.info("✅ Verification token deleted successfully", { token });
  } catch (error) {
    logger.error("❌ Failed to delete verification token", {
      token,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      "Database delete failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};
