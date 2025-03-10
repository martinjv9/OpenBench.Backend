"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_TOPIC = 'sensors/data';
const client = mqtt_1.default.connect(MQTT_BROKER);
client.on('connect', () => {
    console.log('📡 Connected to MQTT broker on', MQTT_BROKER);
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('❌ Subscription error:', err);
        }
        else {
            console.log(`✅ Subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});
client.on('message', (topic, message) => {
    console.log(`📥 Received MQTT message on ${topic}: ${message.toString()}`);
    // Parse incoming sensor data
    try {
        const sensorData = JSON.parse(message.toString());
        console.log('✅ Parsed Sensor Data:', sensorData);
        // TODO: Save to Database and Notify Frontend
    }
    catch (error) {
        console.error('❌ Error parsing sensor data:', error);
    }
});
exports.default = client;
