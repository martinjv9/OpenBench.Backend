import express from "express";
import {
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentByStatusController,
  getEquipmentUsageSummaryController,
} from "../controllers/equipmentController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const router = express.Router();

// Create equipment (Admin and Technician only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  createEquipment
);

// Get all equipment
router.get("/", getEquipment);

// Update equipment (Admin and Technician only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  updateEquipment
);

// Get equipment by status (Admin and Technician only)
router.get(
  "/status",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  getEquipmentByStatusController
);

// Get equipment usage summary (Admin and Technician only)
router.get(
  "/usage-summary",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  getEquipmentUsageSummaryController
);

// Delete equipment (Admin and Technician only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  deleteEquipment
);

export default router;
