require('dotenv').config({path: __dirname + '/../.env'});
const {InfluxDB, Point} = require('@influxdata/influxdb-client');
const {hostname} = require('os');

// Influx DB client.
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
//const bucket = process.env.INFLUXDB_BUCKET;
const port = process.env.INFLUXDB_PORT;

// Initialize Influx DB client and return API object to communicate with the DB.
const initDBAPI = (bucket) => {
    const client = new InfluxDB({url: `${url}:${port}`, token: token});
    //console.log(`Connected to Influx DB: ${url}:${port}`);
    
    const writeAPI = client.getWriteApi(org, bucket);
    console.log(`Influx ${bucket} bucket API available.`);
    writeAPI.useDefaultTags({host: hostname()});

    return writeAPI;
}


// Write data to Influx DB.
// Example: writeData('temperature', '°C', 22.5);
// Inject data to influx DB.
// Inputs: string -> sensorType = temperature, pressure, pH
//         string -> sensorUnit = m, pa, °C
//         float  -> sensorValue
const writeData = (writeAPI, sensorType, sensorUnit, sensorValue) => {
    const point = new Point(sensorType).floatField(sensorUnit, sensorValue);

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

module.exports.initDBAPI = initDBAPI;
module.exports.writeData = writeData;
module.exports.closeClient = closeClient;