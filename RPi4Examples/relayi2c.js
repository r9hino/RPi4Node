// I2C setup (https://github.com/Sensirion/raspberry-pi-i2c-scd4x):
//  - sudo chmod 666 /dev/i2c-1   // Change permission on device. Only for running session. Not permanent.
//  - sudo touch /etc/udev/rules.d/local-i2c.rules  // Permanent solution.
//  - sudo nano /etc/udev/rules.d/local-i2c.rules 
//              ACTION=="add", KERNEL=="i2c-[0-1]*", MODE="0666"
//
// I2C terminal commands:
//  - i2cdetect -y 1
//  - i2cset -y 1 0x24 0b0010
//  - i2cget -y 1 0x24

const i2c = require('i2c-bus');

const I2C_BUS_NUMBER = 1;
const RELAY_ADDRESS = 0x24;

i2c1 = i2c.openSync(I2C_BUS_NUMBER);

async function setRelayState(relayID, state){
    let previewState = null;
    console.log(previewState);
    previewState = getRelayState();
    console.log(previewState);

    const relayMask = 1 << relayID;

    // Determine new state with bit operations. If new state is 1 use OR, if new state is zero use AND.
    const newState = (state == 1) ? (previewState | relayMask) : (previewState & ~relayMask);
    console.log(newState);

    i2c1.sendByte(RELAY_ADDRESS, newState, function(err){
        if(err){
            console.log('Error sending byte to relay i2c: ' + err);
        }
        else{
            console.log('Change state.');
        }
    });
}

function getRelayState(){
    const relayState = i2c1.receiveByteSync(RELAY_ADDRESS);
    return relayState;
}

getRelayState();
setRelayState(5,1);
getRelayState();



