const i2c = require('i2c-bus');
const ADS1115 = require('ads1115');

// Registers
const I2C_BUS_NUMBER = 1;

const MPU6050_ADDRESS = 0x68,
      MPU6050_POWER_MGMT_1 = 0x6b,
      MPU6050_POWER_MGMT_2 = 0x6c,
      MPU6050_TEMP_OUT     = 0x41;

const ADS1115_ADDRESS = 0x48;

class I2CHandler {
    constructor(){
        /*if (!(this instanceof I2CHandler)){
            return new I2CHandler(i2cBusNumber, address);
        }*/
        this.i2cBusNumber = I2C_BUS_NUMBER;
        this.bus = i2c.openSync(I2C_BUS_NUMBER);
        this.calibration = {};

        // Now wake the MPU6050 up as it starts in sleep mode
        this.bus.writeByteSync(MPU6050_ADDRESS, MPU6050_POWER_MGMT_1, 0);
        
        // Initialize connection to ADS1115.
        ADS1115.open(I2C_BUS_NUMBER, ADS1115_ADDRESS, 'i2c-bus').then(async (ads1115) => {
            this.ads1115 = ads1115
        });
    }

    readWord(cmd, done){
        let high, low;
        let that = this;
        async.series([
            function(cb){
                that.bus.readByte(MPU6050_ADDRESS, cmd, function(err, value){
                    high = value;
                    cb(err);
                });
            },
            function(cb){
                that.bus.readByte(MPU6050_ADDRESS, cmd + 1, function(err, value){
                    low = value;
                    cb(err);
                });
            }
        ], function(err){
            if (err) return done(err);
    
            let value = (high << 8) + low;
            done(null, value);
        });
    };

    readWordSync(cmd){
        let high = this.bus.readByteSync(MPU6050_ADDRESS, cmd);
        let low = this.bus.readByteSync(MPU6050_ADDRESS, cmd+1);
        let value = (high << 8) + low;
        return value;
    };

    readWord2c(cmd, done){
        this.readWord(cmd, function (err, value){
            if(err) return done(err);
    
            if(value >= 0x8000){
                done(null, -((65535 - value) + 1));
            }
            else done(null, value);
        });
    };
    
    readWord2cSync(cmd){
        let value = this.readWordSync(cmd);
        if(value >= 0x8000){
            return -((65535 - value) + 1);
        }
        else return value;
    };

    readTemp(done){
        this.readWord2c(MPU6050_TEMP_OUT, function(err, value){
            if (err) return done(err);
            let temp = value / 340 + 36.53; // In degrees Celcius
            done(null, temp);
        });
    };
    
    readTempSync(){
        let temperature = this.readWord2cSync(MPU6050_TEMP_OUT) / 340 + 36.53;
        return temperature.toFixed(2);
    };

    // Read analog signal from ASD1115 analog to digital converter.
    async readAnalog(){
        //let ads = ADS1115.open(this.i2cBusNumber, ADS1115_ADDRESS, 'i2c-bus');
        //ads.gain = 1;
        return this.ads1115.measure('0+GND')
    } // readAnalog()
} // Class

module.exports = I2CHandler;