"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivedSensorData = void 0;
const receivedSensorData = (req, res) => {
    try {
        // sensorNode -> {sensorId, equipmentId, datetime, inUse: 1)  - In use
        // sensorNode -> {sensorId, equipmentId, datetime, inUse: 0)  - Not in use
        // sensorNode -> {sensorId, equipmentId, datetime, inUse: 1)  - In use
        const { sensorId, equipmentId, datetime, inUse } = req.body;
        console.log(`Connection received from Sensor: ${sensorId}`);
        console.log(`Data: equipmentId: ${equipmentId}, datetime: ${datetime}, inUse: ${inUse}`);
        res.status(200).json({ message: "Data received successfully" });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        else {
            console.error("Signal failed to receive", err);
        }
    }
};
exports.receivedSensorData = receivedSensorData;
exports.default = exports.receivedSensorData;
