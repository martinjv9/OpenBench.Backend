import express from "express";
import https from "https";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { httpsOptions } from "./config/httpsConfig";
import authRoutes from "./routes/authRoutes";
import registerRoutes from "./routes/registerRoutes";
import loginRoutes from "./routes/loginRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import mqtt from "mqtt";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const mqttClient = mqtt.connect("mqtt:localhost:1883");

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Only allow 100 requests per IP per window
  message: "Too many requests, please try again later"
});

app.use(limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(helmet());

// MQTT
// When connected
mqttClient.on("connect", () => {
  console.log("📡 MQTT Broker Connected!");
  mqttClient.subscribe("sensor/data"); // Listening to a topic
});

// When message is received
mqttClient.on("message", (topic, message) => {
  console.log(`📩 MQTT Message Received: ${message.toString()}`);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/registerUser", registerRoutes);
app.use("/api/loginUser", loginRoutes);


app.get("/api/sensors", (req, res) => {
  res.json({ status: "Sensors online", timestamp: Date.now() });
});

app.post("/api/data", (req, res) => {
  console.log(req.body);
  res.status(201).json({ message: "Data received!" });
});
// app.use("/api/sensors", sensorRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🔐 HTTPS Server Running on port 3000!\n\nOpenBench numero 1!");
});

// Start HTTP Server (Redirect to HTTPS)
// http.createServer((req, res) => {
//   res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
//   res.end();
// }).listen(80, () => {
//   console.log("🌍 HTTP Server redirecting to HTTPS on port 80");
// });

// Start HTTPS Server
// https.createServer(httpsOptions, app).listen(443, "0.0.0.0", () => {
//   console.log(`🔐 HTTPS Server running on https://openbenches.com`);
// });

// Start HTTP Server (TEMPORARY)
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🌍 Server running on http://0.0.0.0:${PORT}`);
// });

// // Start HTTPS Server
// https.createServer(httpsOptions, app).listen({ port: PORT, host: '0.0.0.0' }, () => {
//   console.log(`🔐 HTTPS Server running on https://localhost:${PORT}`);
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Express Server running on http://0.0.0.0:${PORT}`);
});
