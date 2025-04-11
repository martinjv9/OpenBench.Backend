import express from "express";
import {
  getEquipmentSummary,
  getEquipmentActive,
} from "../controllers/equipmentController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = express.Router();

router.get(
  "/summary",
  authenticateToken,
  authorizeRoles("user", "technician", "admin"),
  getEquipmentSummary
);
router.get("/active", getEquipmentActive);

export default router;
