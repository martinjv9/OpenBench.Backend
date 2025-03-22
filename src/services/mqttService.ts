// src/services/mqttService.ts
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import logger from '../services/loggingService';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_TOPIC = 'sensors/data';

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  logger.info('Connected to MQTT broker', { broker: MQTT_BROKER });

  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      logger.error('MQTT subscription error', { error: err.message });
    } else {
      logger.info('Subscribed to topic', { topic: MQTT_TOPIC });
    }
  });
});

client.on('message', (topic, message) => {
  logger.info('Received MQTT message', { topic, message: message.toString() });

  try {
    const sensorData = JSON.parse(message.toString());
    logger.debug('Parsed sensor data', { sensorData });

    // TODO: Save to DB, notify frontend, etc.

  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error parsing sensor data', { error: error.message });
    } else {
      logger.error('Unknown error parsing sensor data', { error });
    }
  }
});

client.on('error', (err) => {
  logger.error('MQTT connection error', { error: err.message });
});

export default client;
