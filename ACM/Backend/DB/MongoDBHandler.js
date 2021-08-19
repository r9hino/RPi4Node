const {MongoClient} = require('mongodb');
const JSONdb = require('simple-json-db');
const db = new JSONdb('stateDB.json');

const logger = require('../Logs/logger');


class MongoDBHandler {
    constructor(url){
        this.dbClient = null; //await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.url = url;
    }

    connectDB = async () => {
        try{
            this.dbClient = await MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
            logger.info('Connected to remote MongoDB.');
        }
        catch(err){
            logger.error(err);
        }
    }
    // Get hostname device state.
    getDeviceState = async (hostname) => {
        const cursor = await this.dbClient.db('iot').collection('iot_manager').find({hostname: hostname}).toArray();
        //console.log(cursor[0]);
        return cursor[0];
    }

    close = async () => {
        // Disconnect only if there is a connection established.
        if(this.dbClient === null) logger.info('Remote MongoDB connection has already been closed.');
        else{
            try{
                this.dbClient.close();
                logger.info('Remote MongoDB closed.');
            }
            catch(err){
                logger.error(err);
            }
        }
    }
}

module.exports = MongoDBHandler;
