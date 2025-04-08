"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/mqttService.ts
const mqtt_1 = __importDefault(require("mqtt"));
const dotenv_1 = __importDefault(require("dotenv"));
const loggingService_1 = __importDefault(require("../services/loggingService"));
dotenv_1.default.config();
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_TOPIC = 'sensors/data';
const client = mqtt_1.default.connect(MQTT_BROKER, {
    rejectUnauthorized: false,
});
client.on('connect', () => {
    loggingService_1.default.info('Connected to MQTT broker', { broker: MQTT_BROKER });
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            loggingService_1.default.error('MQTT subscription error', { error: err.message });
        }
        else {
            loggingService_1.default.info('Subscribed to topic', { topic: MQTT_TOPIC });
        }
    });
});
client.on('message', (topic, message) => {
    loggingService_1.default.info('Received MQTT message', { topic, message: message.toString() });
    try {
        const sensorData = JSON.parse(message.toString());
        loggingService_1.default.debug('Parsed sensor data', { sensorData });
        // TODO: Save to DB, notify frontend, etc.
    }
    catch (error) {
        if (error instanceof Error) {
            loggingService_1.default.error('Error parsing sensor data', { error: error.message });
        }
        else {
            loggingService_1.default.error('Unknown error parsing sensor data', { error });
        }
    }
});
client.on('error', (err) => {
    loggingService_1.default.error('MQTT connection error', { error: err.message, stack: err.stack });
});
exports.default = client;
