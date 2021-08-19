// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar
// Vue basics: https://github.com/iamshaunjp/Vue-3-Firebase/tree/master
// Vue authentication: https://www.smashingmagazine.com/2020/10/authentication-in-vue-js/

const http = require('http');
const socketio = require('socket.io');
const {hostname} = require('os');
const JSONdb = require('simple-json-db');

const I2CHandler = require('./Controller/I2CHandler');
const osData = require('./Controller/osData');
const SensorMonitor = require('./Controller/SensorMonitor');
const MongoDBHandler = require('./DB/MongoDBHandler');
const InfluxDBHandler = require('./DB/InfluxDBHandler');
const app = require('./ExpressApp/app');
const logger = require('./Logs/logger');

// Environment variables.
require('dotenv').config();
const remoteMongoURL = process.env.MONGODB_URL;
const influxURL = `http://${hostname()}.mooo.com`;
const token = process.env.INFLUXDB_TOKEN;
const influxPort = process.env.INFLUXDB_PORT;
const org = process.env.INFLUXDB_ORG;
const sensorBucket = process.env.INFLUXDB_SENSORS_BUCKET;
const systemBucket = process.env.INFLUXDB_SYSTEM_BUCKET;
const socketioPort = process.env.SOCKETIO_PORT;

// Objects initialization.
const i2c = new I2CHandler();
const temperatureRetriever = async () => await i2c.readTempSync();
const analogRetriever = async () => await i2c.readAnalog();
const temperatureSensor = new SensorMonitor('temperature', '°C', 1000*10, 20, temperatureRetriever);
const analogSensor = new SensorMonitor('voltage', 'V', 1000*1, 10, analogRetriever);
const stateDB = new JSONdb('stateDB.json');
const remoteMongoDB = new MongoDBHandler(remoteMongoURL);
const localInfluxDB = new InfluxDBHandler(influxURL, influxPort, token, org, [sensorBucket, systemBucket]);


let httpServer, io, dynamicDataInterval, tenSecInterval, minuteInterval;

// Sequential initialization functions.
const initializationFunctionList = [
    // Initialize system state.
    async () => {
        let data = stateDB.JSON();  // Find local storage for system state.

        // If there are no entries on the local database, go to MongoDB to retrieve it.
        if(Object.keys(data).length === 0){
            await remoteMongoDB.connectDB();
            const state = await remoteMongoDB.getDeviceState(hostname());
            await remoteMongoDB.close();

            // Store locally system state retrieved from MongoDB.
            logger.info('Store system state retrieved from MongoDB to local database stateDB.json');
            stateDB.JSON(state);
            stateDB.sync();
        }
        else{
            logger.info('System state database already exist.');
        }
    },
    // Initialize http server and socket.io.
    async () => {
        httpServer = http.createServer(app).listen(socketioPort, () => logger.info(`HTTP server for socket.io is listening on port ${socketioPort}`));
        io = socketio(httpServer, {cors: true});
        io.on("connection", socketCoordinator);
    },
    // Initialize intervals.
    async () => {
        tenSecInterval = setInterval(tenSecFunction, 1000*10);
        minuteInterval = setInterval(minuteFunction, 1000*10);
    }
];

async function initializer(){
    for (const task of initializationFunctionList){
        await task().catch(e => logger.error(e));
    }
}

initializer();

// Intervals for data retrieval and injection.
const tenSecFunction = async () => {
    let dynamicData = await osData.getDynamicData();
    if(dynamicData.memoryRAM.activePercent !== null) localInfluxDB.writeData(systemBucket, 'active-ram', '%', dynamicData.memoryRAM.activePercent);
    if(dynamicData.memoryDisk.usedPercent !== null)  localInfluxDB.writeData(systemBucket, 'used-disk', '%', dynamicData.memoryDisk.usedPercent);
    if(dynamicData.cpu.currentLoad !== null) localInfluxDB.writeData(systemBucket, 'cpu', '%', dynamicData.cpu.currentLoad);
};

const minuteFunction = async () => {
    logger.debug(`Temperature average is:' ${temperatureSensor.average()}    ${temperatureSensor.values}`);
    localInfluxDB.writeData(sensorBucket, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
    //console.log(localInfluxDB.writeAPI[sensorBucket].writeBuffer);
    //console.log(localInfluxDB.writeAPI[sensorBucket].retryBuffer);
};

// Coordinate data through sockets.
function socketCoordinator(socket){
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
}

async function onShutdown(){
    logger.info("The server is closing...");
    clearInterval(tenSecInterval);
    clearInterval(minuteInterval);
    clearInterval(dynamicDataInterval);

    try {
        await i2c.close();
        await localInfluxDB.close([sensorBucket, systemBucket]);
        await remoteMongoDB.close();

        io.close(() => {
            logger.info('Socket.io closed.');
            httpServer.close(() => {
                logger.info('HTTP server closed.')
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