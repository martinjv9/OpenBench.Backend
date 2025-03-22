import mqtt from 'mqtt';
import dotenv from 'dotenv';
import logger from './services/loggingService';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_TOPIC = 'sensors/data';

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  // Delete console.log to be replaced with logger after testing
  console.log('📡 Connected to MQTT broker on', MQTT_BROKER);
  logger.info('Connected to MQTT broker', { broker: MQTT_BROKER });

  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      // Delete console.error to be replaced with logger after testing
      logger.error('MQTT subscription error', { error: err.message });
      console.error('❌ Subscription error:', err);
    } else {
      // Delete console.log to be replaced with logger after testing
      logger.info('Subscribed to topic', { topic: MQTT_TOPIC });
      console.log(`✅ Subscribed to topic: ${MQTT_TOPIC}`);
    }
  });
});

client.on('message', (topic, message) => {
  // Delete console.log to be replaced with logger after testing
  logger.info('Received MQTT message', { topic, message: message.toString() });
  console.log(`📥 Received MQTT message on ${topic}: ${message.toString()}`);

  // Parse incoming sensor data
  try {
    const sensorData = JSON.parse(message.toString());
    // Delete console.log to be replaced with logger after testing
    logger.debug('Parsed sensor data', { sensorData });
    console.log('✅ Parsed Sensor Data:', sensorData);

    // TODO: Save to Database and Notify Frontend
  } catch (error) {
    // Delete console.error to be replaced with logger after testing
    if (error instanceof Error) {
      logger.error('Error parsing sensor data', { error: error.message });
    } else {
      logger.error('Unknown error parsing sensor data', { error });
    }
    console.error('❌ Error parsing sensor data:', error);
  }
});

export default client;
