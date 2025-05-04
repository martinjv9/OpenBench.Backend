import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import {
  getAllUsers,
  updateUserRole,
  disableUserAccount,
  getAdminActivityLogs,
} from "../controllers/adminController";

const router = express.Router();

// Protect all routes: Admin only
router.use(authenticateToken, authorizeRoles("admin"));
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/disable", disableUserAccount);
router.get("/logs", getAdminActivityLogs);
export default router;
