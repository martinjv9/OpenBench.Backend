import express from "express";
import { startUsage, endUsage } from "../controllers/usageController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = express.Router();

router.post(
  "/start",
  authenticateToken,
  authorizeRoles("technician", "admin"),
  startUsage
);

router.post(
  "/end",
  authenticateToken,
  authorizeRoles("technician", "admin"),
  endUsage
);

export default router;
