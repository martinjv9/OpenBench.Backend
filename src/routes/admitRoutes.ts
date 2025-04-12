import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = express.Router();

router.get(
  "/getUsers",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "User list retrieved successfully" });
  }
);
