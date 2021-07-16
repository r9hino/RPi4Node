
// Comandos iniciales antes de ejecutar ordenes:
// sudo i2cdetect -y 1              // Detecta las direcciones i2c
// sudo i2cset -y 1 0x68 0x6B 0x01  // Despierte el sensor
// sudo i2cset -y 1 0x68 0x1C 0x00  // Asigna g = 1
// sudo i2cget -y 1 0x68 0x3F w     // Obtiene mediciones eje z


var i2c = require('i2c-bus');
var MPU6050 = require('i2c-mpu6050');
 
var address = 0x68;
var i2c1 = i2c.openSync(1);

console.log(i2c1.readWordSync(address, 0x6B));
i2c1.writeWordSync(address, 0x6B, 0x01);
console.log(i2c1.readWordSync(address, 0x6B));
 
var sensor = new MPU6050(i2c1, address);
 
var data = sensor.readSync();
console.log(data);