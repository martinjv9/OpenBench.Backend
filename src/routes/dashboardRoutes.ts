import express from "express";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = express.Router();

router.get(
  "/summary",
  getDashboardSummary
);

export default router;
