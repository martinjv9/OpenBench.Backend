import { Request, Response } from "express";
import pool from "../config/db";
import { logActivity } from "../services/activityLogsService";
import { getActivityLogs } from "../models/LoggingModel";
import { handleError } from "../services/errorHandler";

// Function to get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, role, is_verified FROM users"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to get a single user by ID and updates their role
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    await logActivity(
      req.user?.id || null,
      "Promote User",
      `Promoted user ID ${id} to role 'technician'`,
      req.ip as string
    );
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to disable or enable a user account
export const disableUserAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { disabled } = req.body;

  try {
    await pool.query("UPDATE users SET is_disabled = ? WHERE id = ?", [
      disabled,
      id,
    ]);
    res.status(200).json({
      message: `User account ${disabled ? "disabled" : "enabled"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/logs
export const getAdminActivityLogs = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await getActivityLogs(limit);
    res.status(200).json(logs);
  } catch (error) {
    handleError(res, error, "Failed to retrieve logs");
  }
};