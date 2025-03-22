import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import './services/mqttService';
import logger from "./services/loggingService";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🔐 HTTPS Server Running on port " + PORT);
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
