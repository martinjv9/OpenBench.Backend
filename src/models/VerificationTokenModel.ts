import pool from "../config/db";
import { sendEmailVerification } from "../services/emailService";
import logger from "../services/loggingService";
import { findUserByEmail } from "./UserModel";
import { RowDataPacket } from "mysql2/promise";


export interface VerificationToken {
  user_id: number;
  token: string;
  expiresAt: Date;
}

export const createVerificationToken = async ({
  user_id,
  token,
  expiresAt,
}: VerificationToken
): Promise<void> => {
  try {
    const sql = `
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
    `;

    const params = [user_id, token, expiresAt];
    await pool.execute(sql, params);
  } catch (error) {
    logger.error("❌ Failed to store sensor data", {
      input: user_id + " " + token,
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
    logger.info("🔑 Finding verification token:", { token });
    const sql = `
        SELECT * FROM email_verification_tokens 
        WHERE token = ? 
        LIMIT 1
      `;
    const [rows]: any = await pool.execute(sql, [token]);

    if (!rows || rows.length === 0) {
      logger.error("❌ Failed findVerificationToken:", {
        error: "Token not found",
      });
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

export const getVerificationTokenByUserId = async (userId: number): Promise<string | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT token FROM email_verification_token WHERE user_id = ?",
    [userId]
  );
  
  return rows[0].token as string;
};

export const resendVerificationToken = async (
  email: string
): Promise<void> => {

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("No user found with that email.");
    }

    if (user.id === undefined) {
      throw new Error("User ID is undefined.");
    }
    const userId: number = user.id!;

    const tokenRecord = await getVerificationTokenByUserId(userId);
    if (!tokenRecord) {
      throw new Error("No verification token found for this user.");
    }

    // Send the verification email
    await sendEmailVerification(email, tokenRecord);

    logger.info("Resent verification token.", { userId, email });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to resend verification token.", {
        error: error.message,
        stack: error.stack,
        email,
      });
    } else {
      logger.error("Failed to resend verification token.", {
        error: String(error),
        email,
      });
    }

    throw error; // Let the controller decide how to handle the error
  }
};