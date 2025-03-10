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
const mqtt_1 = __importDefault(require("mqtt"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
const mqttClient = mqtt_1.default.connect("mqtt:localhost:1883");
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
// MQTT
// When connected
mqttClient.on("connect", () => {
    console.log("📡 MQTT Broker Connected!");
    mqttClient.subscribe("sensor/data", (err) => {
        if (err) {
            console.error("❌ MQTT Subscription Error:", err.message);
        }
    });
});
// When message is received
mqttClient.on("message", (topic, message) => {
    console.log(`📩 MQTT Message Received: ${message.toString()}`);
});
mqttClient.on("error", (error) => {
    console.error("🚨 MQTT Error:", error.message);
});
mqttClient.on("offline", () => {
    console.warn("⚠️ MQTT Broker Offline!");
});
mqttClient.on("reconnect", () => {
    console.log("🔄 Reconnecting to MQTT Broker...");
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
