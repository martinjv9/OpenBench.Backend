import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_TOPIC = 'sensors/data';

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('📡 Connected to MQTT broker on', MQTT_BROKER);
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('❌ Subscription error:', err);
    } else {
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
  } catch (error) {
    console.error('❌ Error parsing sensor data:', error);
  }
});

export default client;
