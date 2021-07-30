const i2c = require('i2c-bus');

// Registers
const POWER_MGMT_1 = 0x6b,
	  POWER_MGMT_2 = 0x6c,
      TEMP_OUT     = 0x41;

class I2CHandler {
    constructor(i2cBusNumber, address) {
        if (!(this instanceof I2CHandler)) {
            return new I2CHandler(i2cBusNumber, address);
        }

        this.bus = i2c.openSync(i2cBusNumber);;
        this.address = address;
        this.calibration = {};

        // Now wake the MPU6050 up as it starts in sleep mode
        this.bus.writeByteSync(address, POWER_MGMT_1, 0);
    }

    readWord(cmd, done) {
        let high, low;
        let that = this;
        async.series([
            function (cb) {
                that.bus.readByte(that.address, cmd, function (err, value) {
                    high = value;
                    cb(err);
                });
            },
            function (cb) {
                that.bus.readByte(that.address, cmd + 1, function (err, value) {
                    low = value;
                    cb(err);
                });
            }
        ], function (err) {
            if (err) return done(err);
    
            let value = (high << 8) + low;
            done(null, value);
        });
    };

    readWordSync(cmd) {
        let high = this.bus.readByteSync(this.address, cmd);
        let low = this.bus.readByteSync(this.address, cmd+1);
        let value = (high << 8) + low;
        return value;
    };

    readWord2c(cmd, done) {
        this.readWord(cmd, function (err, value) {
            if (err) return done(err);
    
            if (value >= 0x8000) {
                done(null, -((65535 - value) + 1));
            }
            else {
                done(null, value);
            }
        });
    };
    
    readWord2cSync(cmd) {
        let value = this.readWordSync(cmd);
        if (value >= 0x8000) {
            return -((65535 - value) + 1);
        } else {
            return value;
        }
    };

    readTemp(done) {
        this.readWord2c(TEMP_OUT, function (err, value) {
            if (err) return done(err);
            let temp = value / 340 + 36.53; // In degrees Celcius
            done(null, temp);
        });
    };
    
    readTempSync() {
        return this.readWord2cSync(TEMP_OUT) / 340 + 36.53;
    };
}

module.exports = I2CHandler;