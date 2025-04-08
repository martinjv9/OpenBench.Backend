import express from "express";
import { getEquipmentSummary, getEquipmentActive } from "../controllers/equipmentController";

const router = express.Router();

router.get("/summary", getEquipmentSummary);
router.get("/active", getEquipmentActive)


export default router;
