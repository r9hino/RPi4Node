const ClassI2C = require('./I2CHandler');

const addressMPU6050 = 0x68;

const i2cbus = 1;
const classI2C = new ClassI2C(i2cbus, addressMPU6050);

const data = classI2C.readTempSync();
console.log(data);