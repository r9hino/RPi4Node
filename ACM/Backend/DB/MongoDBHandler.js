const {MongoClient} = require('mongodb');
const JSONdb = require('simple-json-db');
const db = new JSONdb('stateDB.json');

//const logger = require('../Logs/logger');


class MongoDBHandler {
    constructor(url){
        this.dbClient = null; //await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.url = url;
        this.connected = false;
    }

    connectDB = async () => {
        try{
            this.dbClient = await MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
            this.connected = true;
            console.log('INFO: Connected to remote MongoDB.');
        }
        catch(err){
            this.connected = false;
            console.error('ERROR:', err);
            throw err;
        }
    }

    isConnected = () => {
        return this.connected;
    }

    // Get device metadata store remotely.
    getDeviceMetadata = async (hostname) => {
        try{
            const cursor = await this.dbClient.db('iot').collection('iot_manager').find({hostname: hostname}).toArray();
            return cursor[0];
        }
        catch(err){
            console.error('ERROR:', err);
            throw err;
        }
    }

    // Update device values.
    updateDevice = async (hostname, newValues) => {
        try{
            const id = await this.dbClient.db('iot').collection('iot_manager')
                .updateOne({hostname: hostname}, {$set: newValues});
            return id;
        }
        catch(err){
            console.error('ERROR:', err);
            throw err;
        }
    }

    // Update device relay values.   https://docs.mongodb.com/manual/reference/method/db.collection.update/
    updateRelayState = async (hostname, idRelay, state, dateUpdate) => {
        try{
            const id = await this.dbClient.db('iot').collection('iot_manager')
                .updateOne({hostname: hostname, 'relays.id': idRelay}, {
                    $set: {
                        date_update: dateUpdate,
                        'relays.$.state': state,
                        'relays.$.date_update': dateUpdate,
                    }});
            return id;
        }
        catch(err){
            console.error('ERROR:', err);
            throw err;
        }
    }

    close = async () => {
        // Disconnect only if there is a connection established.
        if(this.connected === false) console.log('INFO: Remote MongoDB connection has already been closed.');
        else{
            try{
                this.dbClient.close();
                this.connected = false;
                console.log('INFO: Remote MongoDB closed.');
            }
            catch(err){
                console.error('ERROR:', err);
            }
        }
    }
}

module.exports = MongoDBHandler;
