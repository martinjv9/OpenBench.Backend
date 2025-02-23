import express from "express";
import https from "https";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { httpsOptions } from "./config/httpsConfig";
import authRoutes from "./routes/authRoutes";
import sensorRoutes from "./routes/sensorRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 443;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🔐 HTTPS Server Running!");
});

// Start HTTPS Server
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`🔐 HTTPS Server running on https://localhost:${PORT}`);
});
