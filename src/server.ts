import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import "./services/mqttService";
import logger from "./services/loggingService";
import dashboardRoutes from "./routes/dashboardRoutes";
import equipmentRoutes from "./routes/equipmentRoutes";
import adminRoutes from "./routes/admitRoutes";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;

// Limit api calls
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use(limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
  logger.http(`Incoming ${req.method} request to ${req.path}`, {
    ip: req.ip,
    headers: req.headers,
  });
  next();
});

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🔐 HTTPS Server Running on port " + PORT);
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
