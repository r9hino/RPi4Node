
const getSensorData = async () => {
    const valueAnalogA3 = 1.1;
    const valueAnalogA4 = 2.2;
    const valueAnalogA5 = 3.3;
    const valueAnalogA6 = 4.4;

    return {
            "analogA3": (valueAnalogA3*100).toFixed(1) + '%  ' + (1.8*valueAnalogA3).toFixed(3) + 'V',
            "analogA4": (valueAnalogA4*100).toFixed(1) + '%  ' + (1.8*valueAnalogA4).toFixed(3) + 'V',
            "analogA5": (valueAnalogA5*100).toFixed(1) + '%  ' + (1.8*valueAnalogA5).toFixed(3) + 'V',
            "analogA6": (valueAnalogA6*100).toFixed(1) + '%  ' + (1.8*valueAnalogA6).toFixed(3) + 'V'
    };
};

module.exports.getSensorData = getSensorData;


/*const ADS1115 = require('ads1115');
 
ADS1115.open(1, 0x48, 'i2c-bus').then(async (ads1115) => {
  ads1115.gain = 1
 
  for (let i = 0; i < 20; i++) {
    let x = await ads1115.measure('0+GND')
    let y = await ads1115.measure('1+GND')
    console.log("ADC0: " + x + "   ADC1: " + y)
  }
})*/