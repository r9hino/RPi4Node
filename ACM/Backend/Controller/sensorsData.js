const ClassI2C = require('./I2CHandler');

const addressMPU6050 = 0x68;
const i2cbus = 1;
const classI2C = new ClassI2C(i2cbus, addressMPU6050);

const getSensorData = async () => {
    const temperature = classI2C.readTempSync();
    const valueAnalogA4 = 2.2;
    const valueAnalogA5 = 3.3;
    const valueAnalogA6 = 4.4;

    return {
            "temperature": temperature.toFixed(1),
            "analogA4": (valueAnalogA4*100).toFixed(1) + '%  ' + (1.8*valueAnalogA4).toFixed(3) + 'V',
            "analogA5": (valueAnalogA5*100).toFixed(1) + '%  ' + (1.8*valueAnalogA5).toFixed(3) + 'V',
            "analogA6": (valueAnalogA6*100).toFixed(1) + '%  ' + (1.8*valueAnalogA6).toFixed(3) + 'V'
    };
};

module.exports.getSensorData = getSensorData;

