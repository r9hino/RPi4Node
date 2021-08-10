// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar

require('dotenv').config();
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const influxPort = process.env.INFLUXDB_PORT;
const org = process.env.INFLUXDB_ORG;
const sensorBucket = process.env.INFLUXDB_SENSORS_BUCKET;
const systemBucket = process.env.INFLUXDB_SYSTEM_BUCKET;
const socketioPort = process.env.SOCKETIO_PORT;


const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const jwt = require("jsonwebtoken");

const I2CHandler = require('./Controller/I2CHandler');
const systemData = require('./Controller/systemData');
const SensorMonitor = require('./Controller/SensorMonitor');
const InfluxDBHandler = require('./DB/InfluxDBHandler');

const app = express();
app.use(express.json());
app.use(cors());

app.post("/login", (req, res) => {
    const USERNAME = "uma";
    const PASSWORD = "8888";
  
    const {username, password} = req.body;
  
    if(username === USERNAME && password === PASSWORD){
      const user = {
        id: 1,
        name: "philippe",
        username: "pi",
      };
      const token = jwt.sign(user, process.env.JWT_KEY);
      res.json({
        token,
        user,
      });
    }
    else{
      res.status(403);
      res.json({
        message: "Wrong login information",
      });
    }
});

const httpServer = http.createServer(app).listen(socketioPort, () => console.log(`HTTP server for socket.io is listening on port ${socketioPort}`));
const io = socketio(httpServer, {cors: true});

const i2c = new I2CHandler();
const localInfluxDB = new InfluxDBHandler(url, influxPort, token, org, [sensorBucket, systemBucket]);

// Sensor retrieving functions.
let temperatureRetriever = async () => await i2c.readTempSync();
let analogRetriever = async () => await i2c.readAnalog();

// Sensors monitoring initialization
let temperatureSensor = new SensorMonitor('temperature', '°C', 1000*10, 20, temperatureRetriever);
let analogSensor = new SensorMonitor('voltage', 'V', 1000*1, 10, analogRetriever);

// Intervals for data injection to Influx DB.
let tenSecInterval = setInterval(async () => {
    let dynamicData = await systemData.getDynamicData();
    console.log(dynamicData.memoryRAM.activePercent, dynamicData.memoryDisk.usedPercent, dynamicData.cpu.currentLoad);
    if(dynamicData.memoryRAM.activePercent !== null) localInfluxDB.writeData(systemBucket, 'active-ram', '%', dynamicData.memoryRAM.activePercent);
    if(dynamicData.memoryDisk.usedPercent !== null)  localInfluxDB.writeData(systemBucket, 'used-disk', '%', dynamicData.memoryDisk.usedPercent);
    if(dynamicData.cpu.currentLoad !== null) localInfluxDB.writeData(systemBucket, 'cpu', '%', dynamicData.cpu.currentLoad);
    //console.log(localInfluxDB.writeAPI[systemBucket].retryBuffer);
    //console.log('Memory data injected.');

    //console.log('Analog average is:', analogSensor.average());
}, 1000*10);

let minuteInterval = setInterval(async () => {
    console.log('Temperature average is:', temperatureSensor.average(), temperatureSensor.values);
    localInfluxDB.writeData(sensorBucket, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
    //console.log(localInfluxDB.writeAPI[sensorBucket].writeBuffer);
    //console.log(localInfluxDB.writeAPI[sensorBucket].retryBuffer);

}, 1000*10);


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

async function onShutdown(){
    console.log("The server is closing...");
    clearInterval(tenSecInterval);
    clearInterval(minuteInterval);
    clearInterval(dataInterval);

    try {
        await i2c.close();
        await localInfluxDB.closeClient([sensorBucket, systemBucket]);
        
        io.close(() => {
            console.log('Socket.io closed.');
            httpServer.close(() => {
                console.log('HTTP server process terminated.')
                process.exit(0);
            });
        });
    }
    catch(error){
        console.log('Error: ', error);
        process.exit(0);
    }
}

process.on('SIGTERM', onShutdown);
process.on('SIGINT', onShutdown);