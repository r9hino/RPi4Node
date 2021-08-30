// Links:
// Promise - async/await: https://blog.risingstack.com/mastering-async-await-in-nodejs/ https://dmitripavlutin.com/what-is-javascript-promise/
// Class: https://javascript.info/class#not-just-a-syntactic-sugar
// Vue basics: https://github.com/iamshaunjp/Vue-3-Firebase/tree/master  https://www.vuemastery.com/pdf/Vue-3-Cheat-Sheet.pdf
// Vue authentication: https://www.smashingmagazine.com/2020/10/authentication-in-vue-js/

// To-do
// Synchronize local and remote database when remote dabase is offline and reconnect.

const http = require('http');
const socketio = require('socket.io');
const {hostname} = require('os');
const JSONdb = require('simple-json-db');
const proceess = require('process');

const I2CHandler = require('./Controller/I2CHandler');
const osData = require('./Controller/osData');
const SensorMonitor = require('./Controller/SensorMonitor');
const MongoDBHandler = require('./DB/MongoDBHandler');
const InfluxDBHandler = require('./DB/InfluxDBHandler');
const app = require('./ExpressApp/app');
//const logger = require('./Logs/logger');

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
const deviceMetadataDB = new JSONdb('deviceMetadataDB.json');
const remoteMongoDB = new MongoDBHandler(remoteMongoURL);
const localInfluxDB = new InfluxDBHandler(influxURL, influxPort, token, org, [sensorBucket, systemBucket]);


let httpServer, io, dynamicDataInterval, tenSecInterval, minuteInterval;

// Sequential initialization functions.
const initializationFunctionList = [
    // Initialize system state.
    async () => {
        let deviceMetadata = deviceMetadataDB.JSON();  // Load local storage for system state if any.

        // If there are no entries on the local database, go to remote MongoDB to retrieve it.
        if(Object.keys(deviceMetadata).length === 0){
            try{
                console.log('INFO: Connecting to remote MongoDB...');
                await remoteMongoDB.connectDB();
                console.log('INFO: Retrieving device metadata from remote MongoDB...');
                deviceMetadata = await remoteMongoDB.getDeviceMetadata(hostname());
            }
            catch(e){
                console.error('ERROR: device metadata was not retrieved from remote MongoDB. Exiting Node server...');
                process.send('STOP');
            }
        }

        // Add OS and system info.
        const newValuesToStore = {
            node_version: process.version,
            architecture: process.arch,
            date_update: new Date().toString(),
        };

        // Store locally OS and system info.
        deviceMetadata = Object.assign(deviceMetadata, newValuesToStore);
        deviceMetadataDB.JSON(deviceMetadata);
        deviceMetadataDB.sync();
        console.log('INFO: New OS and system values stored locally');

        // Store remotely new values retrieved from the OS and system.
        try{
            if(remoteMongoDB.isConnected() === false) await remoteMongoDB.connectDB();
            await remoteMongoDB.updateDevice(hostname(), newValuesToStore);
            console.log('INFO: New OS and system values stored remotely.');
            await remoteMongoDB.close();
        }
        catch(e){
            console.log('WANRING: Couldn\'t store new OS and system values in the remote MongoDB.');
        };
    },
    // Initialize http server and socket.io.
    async () => {
        httpServer = http.createServer(app).listen(socketioPort, () => console.log(`INFO: HTTP server for socket.io is listening on port ${socketioPort}`));
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
    for(const task of initializationFunctionList){
        await task().catch(e => process.exit(1));
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
    //console.log(`DEBUG: Average temperature: ${temperatureSensor.average().toFixed(1)}    ${temperatureSensor.values}`);
    localInfluxDB.writeData(sensorBucket, temperatureSensor.sensorType, temperatureSensor.unit, temperatureSensor.average());
    //console.log(localInfluxDB.writeAPI[sensorBucket].writeBuffer);
    //console.log(localInfluxDB.writeAPI[sensorBucket].retryBuffer);
};

// Coordinate data through sockets.
function socketCoordinator(socket){
    remoteMongoDB.connectDB().catch((e) => console.log('WARNING: Couldn\'t connect to remote MongoDB at starting of socket connection.'));
    console.log(`INFO: Client connected  -  IP ${socket.request.connection.remoteAddress.split(':')[3]}  -  Client(s) ${io.engine.clientsCount}`);

    if(dynamicDataInterval) clearInterval(dynamicDataInterval);

    // At connection send static and dynamic system data.
    osData.getStaticData().then(data => socket.emit('socketStaticSystemData', data));
    osData.getDynamicData().then(data => socket.emit('socketDynamicSystemData', data));

    dynamicDataInterval = setInterval(() => {
        osData.getDynamicData().then(data => socket.emit('socketDynamicSystemData', data));

        socket.emit('socketAnalogValues', {
            analog0: analogSensor.average(),
            temperature: temperatureSensor.average()
        });
    }, 2000);

    // Home page: client request for device states only when mounting the page.
    socket.on('reqRelayStates', () => {
        let relays = deviceMetadataDB.get('relays');
        socket.emit('resRelayStates', relays);  // Send device state only to socket requesting it.
    });

    // Home page: listen for changes made by user on client side. Then update device state.
    socket.on('elementChanged', (relay) => {
        // Broadcast new device state to everyone except sender.
        socket.broadcast.emit('updateClients', relay);
        let idRelay = relay.id;
        let relayState = relay.state;
        let dateUpdate = new Date().toString();
        let relays = deviceMetadataDB.get('relays');
        relays[idRelay].state = relayState;
        relays[idRelay].date_update = dateUpdate;

        // Store new state on the local DB.
        deviceMetadataDB.set('relays', relays);
        deviceMetadataDB.set('date_update', dateUpdate);
        deviceMetadataDB.sync();

        // Store remotely new state.
        if(remoteMongoDB.isConnected() === false){
            remoteMongoDB.connectDB().then(() => {
                // As remote DB was disconnected, local and remote DB may have different states.
                // So local DB is loaded and then uploaded completely to the remote DB.
                const deviceMetadata = deviceMetadataDB.JSON();
                delete deviceMetadata["_id"];   // _id is inmutable and can not be updated.
                remoteMongoDB.updateDevice(hostname(), deviceMetadata).catch(e => console.log('WARNING: Couldn\'t update relay state on remote MongoDB'))
            });
        }
        else remoteMongoDB.updateRelayState(hostname(), idRelay, relayState, dateUpdate).catch(e => console.log('WARNING: Couldn\'t update relay state on remote MongoDB'));
    });

    socket.on('disconnect', () => {
        console.log(`INFO: Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(dynamicDataInterval);
        remoteMongoDB.close();
    });
}

async function shutdownServer(){
    console.log('INFO: Shuting down the server...');
    clearInterval(tenSecInterval);
    clearInterval(minuteInterval);
    clearInterval(dynamicDataInterval);

    try {
        await i2c.close();
        await localInfluxDB.close([sensorBucket, systemBucket]);
        await remoteMongoDB.close();

        io.close(() => {
            console.log('INFO: Socket.io closed.');
            httpServer.close(() => {
                console.log('INFO: HTTP server closed.')
                process.exit(0);
            });
        });
    }
    catch(error){
        console.error('ERROR: ', error);
        process.exit(0);
    }
}

process.on('SIGTERM', shutdownServer);
process.on('SIGINT', shutdownServer);
process.on('STOP', shutdownServer);