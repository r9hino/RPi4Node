require('dotenv').config({path: __dirname + '/../.env'});
const {InfluxDB, Point} = require('@influxdata/influxdb-client');
const {hostname} = require('os');


class InfluxDBHandler {
    constructor(url, port, token, org, bucket){
        this.org = org;
        this.dbClient = new InfluxDB({url: `${url}:${port}`, token: token});

        // witeAPI object store different bucket API.
        this.writeAPI = {};
        // Create a default writeAPI for a bucket.
        this.addWriteAPI(bucket);
    }

    // Add write API for other
    addWriteAPI(bucket){
        let writeAPI = this.dbClient.getWriteApi(this.org, bucket);
        console.log(`Influx ${bucket} bucket API available.`);
        writeAPI.useDefaultTags({host: hostname()});

        this.writeAPI[bucket] = writeAPI;
    }

    writeData = (bucket, measurementType, measurementUnit, value) => {
        const point = new Point(measurementType).floatField(measurementUnit, value);
        this.writeAPI[bucket].writePoint(point);
    }

    closeClient = (bucket) => {
        this.writeAPI[bucket].close()
            .then(() => {
                console.log('Closing database connection.');
            })
            .catch(e => {
                console.error(e);
                console.log('Error.');
            });
    }
}

module.exports = InfluxDBHandler;