import express from "express";
import { getEquipmentSummary } from "../controllers/equipmentController";

const router = express.Router();

router.get("/summary", getEquipmentSummary);

export default router;
