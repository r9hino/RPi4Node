// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar

require('dotenv').config();
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const influxPort = process.env.INFLUXDB_PORT;
const org = process.env.INFLUXDB_ORG;
const sensorBucket = process.env.INFLUXDB_SENSORS_BUCKET;


const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const I2CHandler = require('./Controller/I2CHandler');
const systemData = require('./Controller/systemData');
const SensorMonitor = require('./Controller/SensorMonitor');
const InfluxDBHandler = require('./DB/InfluxDBHandler');

const app = express();
const port = process.env.SOCKETIO_PORT;
const httpServer = http.createServer(app).listen(port, () => console.log(`Listening on port ${port}`));
const io = socketio(httpServer, {cors: true});

const i2c = new I2CHandler();
const localInfluxDB = new InfluxDBHandler(url, influxPort, token, org, sensorBucket);

// Sensor retrieving functions.
let temperatureRetriever = async () => {
    //console.log('Temperature retrieved: ', data.temperature);
    return await i2c.readTempSync();
};
let analogRetriever = async () => {
    //console.log('Temperature retrieved: ', data.temperature);
    return await i2c.readAnalog();
};

// Sensors monitoring initialization
let temperatureSensor = new SensorMonitor('temperature', '°C', 1000*10, 20, temperatureRetriever);
let analogSensor = new SensorMonitor('Voltage', 'V', 1000*1, 10, analogRetriever);

// Intervals for data injection to Influx DB.
let tenSecInterval = setInterval(async () => {
    let dynamicData = await systemData.getDynamicData();
    //influxHandler.writeData(influxOSAPI, 'memory', '%', dynamicData.memoryRAM.active);
    //influxHandler.writeData(influxOSAPI, 'cpu', '%', dynamicData.cpu.currentLoad);
    //console.log('Memory data injected.');

    console.log('Analog average is:', analogSensor.average());
}, 1000*10);

let minuteInterval = setInterval(async () => {
    console.log('Temperature average is:', temperatureSensor.average(), temperatureSensor.values);
    localInfluxDB.writeData(sensorBucket, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
}, 1000*15);


// Send data through sockets.
let dataInterval;
io.on("connection", (socket) => {
    console.log(`Client connected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);

    if(dataInterval) clearInterval(dataInterval);

    // Promise with the static system data.
    systemData.getStaticData()
              .then(data => io.emit('socketStaticSystemData', data));

    dataInterval = setInterval(() => {
        // Promise with the dynamic system data.
        systemData.getDynamicData()
                  .then(/*data => io.emit('socketDynamicSystemData', data)*/);
        // Promise with the sensor data.

        let analogData = {
            analog0: analogSensor.average(),
            temperature: temperatureSensor.average()
        };

        io.emit('socketAnalogValues', analogData);
    }, 1000);

    socket.on("disconnect", () => {
        console.log(`Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(dataInterval);
    });
});

process.on('SIGTERM', () => {
    influx.closeClient(influxAPI);
    httpServer.close(() => {
        console.log('HTTP server process terminated.')
    })
})