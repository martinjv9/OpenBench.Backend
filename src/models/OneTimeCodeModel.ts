import pool from "../config/db";
import bcrypt from "bcryptjs";
import { generateMFACode } from "../utils/generateMFACode";
import dotenv from "dotenv";
import { log } from "console";
import logger from "../services/loggingService";

dotenv.config();

export interface OneTimeCode {
  userId: number;
  codeHash: string;
  expiresAt: Date;
}

export const createOneTimeCode = async (
  userId: number,
  expiresInMinutes = 5
): Promise<string> => {
  try {
    const code = generateMFACode();
    const hash = await bcrypt.hash(
      code,
      process.env.BCRYPT_SALT_ROUNDS
        ? parseInt(process.env.BCRYPT_SALT_ROUNDS)
        : 12
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const sql = `
    INSERT INTO one_time_codes (user_id, code_hash, expires_at)
    VALUES (?, ?, ?)
    `;

    const params = [userId, hash, expiresAt];
    await pool.execute(sql, params);

    return code;
  } catch (error) {
    logger.error("❌ Error in createOneTimeCode:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error("❌ Error in createOneTimeCode:", error);
    throw new Error(
      "Failed to create one-time code: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export const findOneTimeCodebyUserId = async (
  userId: number
): Promise<OneTimeCode | null> => {
  try {
    const sql = `
      SELECT * FROM one_time_codes 
      WHERE user_id = ? 
      LIMIT 1
    `;
    const [rows]: any = await pool.execute(sql, [userId]);
    console.log("Rows:", rows); // Debugging line to check retrieved rows

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      userId: row.user_id,
      codeHash: row.code_hash,
      expiresAt: row.expires_at,
    };
  } catch (error) {
    logger.error("❌ Database Error in findOneTimeCode:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error("❌ Database Error in findOneTimeCode:", error);
    throw new Error(
      "Database query failed: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export const deleteOneTimeCode = async (userId: number): Promise<void> => {
  try {
    const sql = `
      DELETE FROM one_time_codes 
      WHERE user_id = ?
    `;
    await pool.execute(sql, [userId]);
  } catch (error) {
    logger.error("❌ Database Error in deleteOneTimeCode:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error("❌ Database Error in deleteOneTimeCode:", error);
    throw new Error(
      "Failed to delete one-time code: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};
