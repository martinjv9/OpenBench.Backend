"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sensorController_1 = require("../controllers/sensorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post("/data", authMiddleware_1.authenticateToken, sensorController_1.receivedSensorData); // ✅ Protected route
exports.default = router;
