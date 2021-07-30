// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/

require('dotenv').config();

const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const systemData = require('./Controller/systemData');
const sensorsData = require('./Controller/sensorsData');
const SensorMonitor = require('./Controller/SensorMonitor');
const influx = require('./DB/dbclient');
const influxAPI = influx.dbInitialization();


// Sensor retrieving functions.
let temperatureRetriever = async () => {
    //console.log('Temperature retrieved: ', data.temperature);
    return await sensorsData.getTemperature();
};
// Sensors initialization
let temperatureSensor = new SensorMonitor('temperature', '°C', 1000*10, 10, temperatureRetriever);

const app = express();
const port = process.env.SOCKETIO_PORT;
const httpServer = http.createServer(app).listen(port, () => console.log(`Listening on port ${port}`));
const io = socketio(httpServer, {cors: true});

// Data injection intervals to Influx DB.
let fiveSecInterval = setInterval(async () => {
    let dynamicData = await systemData.getDynamicData();
    influx.writeData(influxAPI, 'memory', '%', dynamicData.memoryRAM.active);
    console.log('Memory data injected.');
}, 1000*5);

let minuteInterval = setInterval(async () => {
    console.log('Temp is ', temperatureSensor.values);
    influx.writeData(influxAPI, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
}, 1000*60);


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
        sensorsData.getSensorData()
                   .then(data => {
                       io.emit('socketAnalogValues', data);
                       //influx.writeData(influxAPI, 'temperature', '°C', data.temperature);
                    });
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