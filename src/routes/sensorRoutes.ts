import express from "express";
import { receivedSensorData } from "../controllers/sensorController";

const router = express.Router();

router.post("/data", receivedSensorData);

export default router;
