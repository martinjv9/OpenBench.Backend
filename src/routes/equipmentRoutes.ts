import express from "express";
import {
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentByStatusController,
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

// Delete equipment (Admin and Technician only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "technician"),
  deleteEquipment
);

export default router;
