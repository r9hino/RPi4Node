// Links
// https://github.com/influxdata/influxdb-client-js/blob/master/examples/writeAdvanced.js

const {InfluxDB, Point} = require('@influxdata/influxdb-client');
const {hostname} = require('os');

//const logger = require('../Logs/logger');


class InfluxDBHandler {
    constructor(url, port, token, org, buckets){
        this.org = org;
        let writeOptions = {
            batchSize: 2,
            flushInterval: 0,
            //writeFailed: [Function: writeFailed],
            //writeSuccess: [Function: writeSuccess],
            maxRetries: 10,
            maxRetryTime: 1000*60*60*24*3,
            maxBufferLines: 32000,
            gzipThreshold: 1000,
            minRetryDelay: 5000,
            maxRetryDelay: 1000*60*60,
            defaultTags: {host: hostname()},

        };
        this.dbClient = new InfluxDB({url: `${url}:${port}`, token: token, writeOptions});

        // witeAPI object store different bucket API.
        this.writeAPI = {};
        // Create a default writeAPI for a bucket.
        this.addWriteAPI(buckets);
    }

    // Add write API so then we can write or query data.
    addWriteAPI(buckets){
        buckets.forEach(bucket => {
            let writeAPI = this.dbClient.getWriteApi(this.org, bucket);
            console.log(`INFO: Influx ${bucket} bucket API available.`);

            this.writeAPI[bucket] = writeAPI;  
        });
    }

    writeData = (bucket, measurementType, measurementUnit, value) => {
        const point = new Point(measurementType).floatField(measurementUnit, value);
        this.writeAPI[bucket].writePoint(point);
    }

    close = async (buckets) => {
        await Promise.all(buckets.map(async bucket => {
            await this.writeAPI[bucket].close();
            console.log(`INFO: InfluxDB ${bucket} bucket closed.`);
        }));
    }
}

module.exports = InfluxDBHandler;