import mqtt from "mqtt";
import dotenv from "dotenv";
import logger from "../services/loggingService";
import { postSensorData } from "../controllers/sensorController";
import { Request, Response } from "express";

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://localhost";
const MQTT_TOPIC = "sensors/data";

const client = mqtt.connect(MQTT_BROKER, {
  rejectUnauthorized: false,
});

client.on("connect", () => {
  logger.info("Connected to MQTT broker", { broker: MQTT_BROKER });

  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      logger.error("MQTT subscription error", { error: err.message });
    } else {
      logger.info("Subscribed to topic", { topic: MQTT_TOPIC });
    }
  });
});

client.on("message", async (topic, message) => {
  logger.info("Received MQTT message", { topic, message: message.toString() });

  try {
    const parsedData = JSON.parse(message.toString());

    // ✅ Construct a fake Request and Response object
    const mockReq = {
      body: parsedData,
    } as Request;

    const mockRes = {
      status: (code: number) => {
        return {
          json: (data: any) => {
            logger.info(`Sensor data processed: ${code}`, data);
          },
        };
      },
    } as unknown as Response;

    await postSensorData(mockReq, mockRes);
  } catch (error) {
    logger.error("Failed to handle MQTT message", {
      error: error instanceof Error ? error.message : error,
    });
  }
});

client.on("error", (err) => {
  logger.error("MQTT connection error", {
    error: err.message,
    stack: err.stack,
  });
});

export default client;
