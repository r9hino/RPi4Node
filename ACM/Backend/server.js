// Good links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/

require('dotenv').config();

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const systemData = require('./Controller/systemData');
const sensorsData = require('./Controller/sensorsData');

const influx = require('./DB/dbclient');
const influxAPI = influx.dbInitialization();

const app = express();

const port = process.env.SOCKETIO_PORT;
const httpServer = http.createServer(app)
                       .listen(port, () => console.log(`Listening on port ${port}`));
const io = socketio(httpServer, {cors: true});

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
                  .then(data => {
                      io.emit('socketDynamicSystemData', data);
                      influx.writeData(influxAPI, 'memory', '%', data.memoryRAM.active);
                  });
        // Promise with the sensor data.
        sensorsData.getSensorData()
                   .then(data => io.emit('socketAnalogValues', data));
    }, 1000);
    
    socket.on("disconnect", () => {
        console.log(`Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(dataInterval);
        influx.closeClient(influxAPI);
    });
});
