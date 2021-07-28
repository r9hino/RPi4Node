// Only temperature in MPU6050.
// Registers
var POWER_MGMT_1 = 0x6b,
	POWER_MGMT_2 = 0x6c;
var ACCEL_XOUT = 0x3b,
	ACCEL_YOUT = 0x3d,
	ACCEL_ZOUT = 0x3f;
var TEMP_OUT = 0x41;
var GYRO_XOUT = 0x43,
	GYRO_YOUT = 0x45,
	GYRO_ZOUT = 0x47;
    
function Sensor(bus, address) {
	if (!(this instanceof Sensor)) {
		return new Sensor(bus, address);
	}

	this.bus = bus;
	this.address = address;
	this.calibration = {};

	// Now wake the MPU6050 up as it starts in sleep mode
	bus.writeByteSync(address, POWER_MGMT_1, 0);
}


Sensor.prototype.readWord = function (cmd, done) {
	var high, low;
	var that = this;
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

		var value = (high << 8) + low;
		done(null, value);
	});
};

Sensor.prototype.readWordSync = function (cmd) {
	var high = this.bus.readByteSync(this.address, cmd);
	var low = this.bus.readByteSync(this.address, cmd+1);
	var value = (high << 8) + low;
	return value;
};

Sensor.prototype.readWord2c = function (cmd, done) {
	this.readWord(cmd, function (err, value) {
		if (err) return done(err);

		if (value >= 0x8000) {
			done(null, -((65535 - value) + 1));
		} else {
			done(null, value);
		}
	});
};

Sensor.prototype.readWord2cSync = function (cmd) {
	var value = this.readWordSync(cmd);
	if (value >= 0x8000) {
		return -((65535 - value) + 1);
	} else {
		return value;
	}
};

Sensor.prototype.readTemp = function (done) {
	this.readWord2c(TEMP_OUT, function (err, value) {
		if (err) return done(err);
		var temp = value / 340 + 36.53; // In degrees Celcius
		done(null, temp);
	});
};

Sensor.prototype.readTempSync = function () {
	return this.readWord2cSync(TEMP_OUT) / 340 + 36.53;
};

module.exports = Sensor;