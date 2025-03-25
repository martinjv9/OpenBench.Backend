"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sensorRoutes_1 = __importDefault(require("./routes/sensorRoutes"));
require("./services/mqttService");
const loggingService_1 = __importDefault(require("./services/loggingService"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;
// Middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later",
});
app.use(limiter);
app.use(express_1.default.json({ limit: "10kb" }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((req, res, next) => {
    loggingService_1.default.http(`Incoming ${req.method} request to ${req.path}`, {
        ip: req.ip,
        headers: req.headers,
    });
    next();
});
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/sensors", sensorRoutes_1.default);
// Test Route
app.get("/", (req, res) => {
    res.send("🔐 HTTPS Server Running on port " + PORT);
});
// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌍 Server running on http://localhost:${PORT}`);
});
