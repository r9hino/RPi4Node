const ADS1115 = require('ads1115');
 
ADS1115.open(1, 0x48, 'i2c-bus').then(async (ads1115) => {
  ads1115.gain = 1
 
  for (let i = 0; i < 20; i++) {
    let x = await ads1115.measure('0+GND')
    let y = await ads1115.measure('1+GND')
    console.log("ADC0: " + x + "   ADC1: " + y)
  }
})

/*const ADS1115 = require('ads1115');
const i2c = require('i2c-bus');


i2c.openPromisified(1).then(async (bus) => {
  const ads1115 = await ADS1115(bus,0x48);
  // ads1115.gain = 1
 
  for (let i = 0; i < 20; i++) {
    let value = await ads1115.measure('0+GND');
    console.log("ADC0: " + value);
  }
})
*/