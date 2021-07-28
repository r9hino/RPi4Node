require('dotenv').config({path: __dirname + '/../.env'});
const {InfluxDB, Point} = require('@influxdata/influxdb-client');
const {hostname} = require('os');

// Influx DB client.
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;
const port = process.env.INFLUXDB_PORT;

// Initialize Influx DB client and return API object to communicate with the DB.
const dbInitialization = () => {
    const client = new InfluxDB({url: `${url}:${port}`, token: token});
    console.log(`Connected to Influx DB: ${url}:${port}`);
    
    const writeAPI = client.getWriteApi(org, bucket);
    writeAPI.useDefaultTags({host: hostname()});

    return writeAPI;
}


//writeData('temperature', '°C', 22.5);
// Inject data to influx DB.
// Inputs: sensorType is a string (temperature, pressure, pH)
//         sensorUnit is a string (m, pa, °C)
//         sensorValue is a float (32.2 30.0)
const writeData = (writeAPI, sensorType, sensorUnit, sensorValue) => {
    const point = new Point(sensorType)
                        .floatField(sensorUnit, sensorValue);

    writeAPI.writePoint(point);
    
}

const closeClient = (writeAPI) => {
    writeAPI.close()
        .then(() => {
            console.log('Closing database connection.');
        })
        .catch(e => {
            console.error(e);
            console.log('Error.');
        });
}
module.exports.dbInitialization = dbInitialization;
module.exports.writeData = writeData;
module.exports.closeClient = closeClient;