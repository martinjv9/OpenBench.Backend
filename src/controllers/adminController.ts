import { Request, Response } from "express";
import pool from "../config/db";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query(
      "SELECT userId, username, email, roles, disabled FROM users"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query("UPDATE users SET roles = ? WHERE userId = ?", [role, id]);
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const disableUserAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { disabled } = req.body;

  try {
    await pool.query("UPDATE users SET disabled = ? WHERE userId = ?", [
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
