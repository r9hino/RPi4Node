// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar
// Vue basics: https://github.com/iamshaunjp/Vue-3-Firebase/tree/master
// Vue authentication: https://www.smashingmagazine.com/2020/10/authentication-in-vue-js/

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
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketio = require('socket.io');

const I2CHandler = require('./Controller/I2CHandler');
const systemData = require('./Controller/systemData');
const SensorMonitor = require('./Controller/SensorMonitor');
const InfluxDBHandler = require('./DB/InfluxDBHandler');
const routes = require('./routes/routes');

const app = express();
app.use(express.json({ limit: '10kb' }));
const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 25, // limit each IP to 100 requests per windowMs
    message: 'Too many requests' // message to send
});
app.use(limiter);
app.use(cors());
app.use(routes);

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
let dynamicDataInterval;
io.on("connection", (socket) => {
    console.log(`Client connected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);

    if(dynamicDataInterval) clearInterval(dynamicDataInterval);

    // At connection send static and dynamic system data.
    systemData.getStaticData().then(data => io.emit('socketStaticSystemData', data));
    systemData.getDynamicData().then(data => io.emit('socketDynamicSystemData', data));

    dynamicDataInterval = setInterval(() => {
        systemData.getDynamicData().then(data => io.emit('socketDynamicSystemData', data));

        io.emit('socketAnalogValues', {
            analog0: analogSensor.average(),
            temperature: temperatureSensor.average()
        });
    }, 2000);

    socket.on("disconnect", () => {
        console.log(`Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(dynamicDataInterval);
    });
});

async function onShutdown(){
    console.log("The server is closing...");
    clearInterval(tenSecInterval);
    clearInterval(minuteInterval);
    clearInterval(dynamicDataInterval);

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