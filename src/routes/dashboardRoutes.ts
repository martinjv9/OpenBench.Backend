import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = express.Router();

router.get(
  "/summary",
  authenticateToken,
  authorizeRoles("technician", "admin"),
  getDashboardSummary
);

export default router;
