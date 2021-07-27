const {InfluxDB, Point} = require('@influxdata/influxdb-client');
const {hostname} = require('os')


// Influx DB client.
const token = 'hYwmUEp7UlvcpaF9-vcZHSXW-YfynoKMO915cb60XH3JVFjcuZApRHM3AyamX43fhndjBkXxd8jOkVSM3ZJjSQ=='
const org = 'SET'
const bucket = 'SET-bucket'
const client = new InfluxDB({url: 'http://rpi4id0.mooo.com:8086', token: token})


const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({host: hostname()});

function writeData(sensor, sensorValue, sensorUnit){
    const point = new Point(sensor).floatField(sensorUnit, sensorValue);

    writeApi.writePoint(point);
    writeApi.close()
        .then(() => {
            console.log('FINISHED');
        })
        .catch(e => {
            console.error(e);
            console.log('\\nFinished ERROR');
        });
}

