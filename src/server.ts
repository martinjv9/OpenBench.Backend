import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import equipmentRoutes from "./routes/equipmentRoutes";
import adminRoutes from "./routes/adminRoutes";
import "./services/mqttService"; // Initialize MQTT connection
import logger from "./services/loggingService";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL, // must match your frontend exactly
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // allow cookies
};

app.use(express.json({ limit: "10kb" }));
app.use(cors(corsOptions));
app.use(helmet());
app.use((req, res, next) => {
  logger.http(`Incoming ${req.method} request to ${req.path}`, {
    ip: req.ip,
    headers: req.headers,
  });
  next();
});
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit to 10 login attempts
  message: "Too many login attempts, please try again later",
});
app.use("/api/auth/login", authLimiter);

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many registration attempts, please try again later",
});
app.use("/api/auth/register", registerLimiter);

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

const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`⚡ Client disconnected: ${socket.id}`);
  });
});

// Start Server
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🌍 Server running on http://localhost:${PORT}`);
// });

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server + Socket.io running on http://localhost:${PORT}`);
});
