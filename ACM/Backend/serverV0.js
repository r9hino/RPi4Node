// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar
// Vue basics: https://github.com/iamshaunjp/Vue-3-Firebase/tree/master
// Vue authentication: https://www.smashingmagazine.com/2020/10/authentication-in-vue-js/

const http = require('http');
const socketio = require('socket.io');
const {hostname} = require('os');

const I2CHandler = require('./Controller/I2CHandler');
const osData = require('./Controller/osData');
const SensorMonitor = require('./Controller/SensorMonitor');
const InfluxDBHandler = require('./DB/InfluxDBHandler');
const app = require('./ExpressApp/app');
const logger = require('./Logs/logger');

require('dotenv').config();
const influxURL = `http://${hostname()}.mooo.com`;
const token = process.env.INFLUXDB_TOKEN;
const influxPort = process.env.INFLUXDB_PORT;
const org = process.env.INFLUXDB_ORG;
const sensorBucket = process.env.INFLUXDB_SENSORS_BUCKET;
const systemBucket = process.env.INFLUXDB_SYSTEM_BUCKET;
const socketioPort = process.env.SOCKETIO_PORT;


const httpServer = http.createServer(app).listen(socketioPort, () => logger.info(`HTTP server for socket.io is listening on port ${socketioPort}`));
const io = socketio(httpServer, {cors: true});

const i2c = new I2CHandler();
const localInfluxDB = new InfluxDBHandler(influxURL, influxPort, token, org, [sensorBucket, systemBucket]);

// Sensors monitoring initialization
let temperatureRetriever = async () => await i2c.readTempSync();
let analogRetriever = async () => await i2c.readAnalog();
let temperatureSensor = new SensorMonitor('temperature', '°C', 1000*10, 20, temperatureRetriever);
let analogSensor = new SensorMonitor('voltage', 'V', 1000*1, 10, analogRetriever);

// Intervals for data injection to Influx DB.
let tenSecInterval = setInterval(async () => {
    let dynamicData = await osData.getDynamicData();
    //logger.debug(`${dynamicData.memoryRAM.activePercent} - ${dynamicData.memoryDisk.usedPercent} - ${dynamicData.cpu.currentLoad}`);
    if(dynamicData.memoryRAM.activePercent !== null) localInfluxDB.writeData(systemBucket, 'active-ram', '%', dynamicData.memoryRAM.activePercent);
    if(dynamicData.memoryDisk.usedPercent !== null)  localInfluxDB.writeData(systemBucket, 'used-disk', '%', dynamicData.memoryDisk.usedPercent);
    if(dynamicData.cpu.currentLoad !== null) localInfluxDB.writeData(systemBucket, 'cpu', '%', dynamicData.cpu.currentLoad);
    //console.log(localInfluxDB.writeAPI[systemBucket].retryBuffer);
    //console.log('Memory data injected.');

    //console.log('Analog average is:', analogSensor.average());
}, 1000*10);

let minuteInterval = setInterval(async () => {
    logger.debug(`Temperature average is:' ${temperatureSensor.average()}    ${temperatureSensor.values}`);
    localInfluxDB.writeData(sensorBucket, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
    //console.log(localInfluxDB.writeAPI[sensorBucket].writeBuffer);
    //console.log(localInfluxDB.writeAPI[sensorBucket].retryBuffer);

}, 1000*10);


// Send data through sockets.
let dynamicDataInterval;
io.on("connection", (socket) => {
    logger.info(`Client connected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);

    if(dynamicDataInterval) clearInterval(dynamicDataInterval);

    // At connection send static and dynamic system data.
    osData.getStaticData().then(data => io.emit('socketStaticSystemData', data));
    osData.getDynamicData().then(data => io.emit('socketDynamicSystemData', data));

    dynamicDataInterval = setInterval(() => {
        osData.getDynamicData().then(data => io.emit('socketDynamicSystemData', data));

        io.emit('socketAnalogValues', {
            analog0: analogSensor.average(),
            temperature: temperatureSensor.average()
        });
    }, 2000);

    socket.on("disconnect", () => {
        logger.info(`Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(dynamicDataInterval);
    });
});

async function onShutdown(){
    logger.info("The server is closing...");
    clearInterval(tenSecInterval);
    clearInterval(minuteInterval);
    clearInterval(dynamicDataInterval);

    try {
        await i2c.close();
        await localInfluxDB.closeClient([sensorBucket, systemBucket]);

        io.close(() => {
            logger.info('Socket.io closed.');
            httpServer.close(() => {
                logger.info('HTTP server process terminated.')
                process.exit(0);
            });
        });
    }
    catch(error){
        logger.error('Error: ', error);
        process.exit(0);
    }
}

process.on('SIGTERM', onShutdown);
process.on('SIGINT', onShutdown);