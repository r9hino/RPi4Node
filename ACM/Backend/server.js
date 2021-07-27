const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const si = require('systeminformation');

const app = express();

const port = process.env.PORT || 5000;
const httpServer = http.createServer(app).listen(port, () => console.log(`Listening on port ${port}`));
const io = socketio(httpServer, {cors: true});

// Bone: AIN -> P9_39: A0    P9_40: A1    P9_37: A2    P9_38: A3    P9_33: A4    P9_36: A5     P9_35: A6
const inAnalogA3 = "A3";
const inAnalogA4 = "A4";
const inAnalogA5 = "A5";
const inAnalogA6 = "A6";

let interval;

io.on("connection", (socket) => {
    console.log(`Client connected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);

    if(interval) clearInterval(interval);
    
    getStaticSystemData();
    
    interval = setInterval(() => {
        getDynamicSystemData();
        getSensorData();
    }, 1000);
    
    socket.on("disconnect", () => {
        console.log(`Client disconnected  -  IP ${socket.request.connection.remoteAddress.split(":")[3]}  -  Client(s) ${io.engine.clientsCount}`);
        if(io.engine.clientsCount === 0) clearInterval(interval);
    });
});


const getStaticSystemData = async () => {
    try {
        let [osInfo, network, networkGateway] = await Promise.all([si.osInfo(), si.networkInterfaces(), si.networkGatewayDefault()]);
        network = network[0];//.filter(obj => {return obj.type === 'wireless'})[0];

        const staticSystemData = {};

        staticSystemData.osInfo = {
            distro: `${osInfo.distro.slice(0,6)} ${osInfo.release} - ${osInfo.codename.charAt(0).toUpperCase() + osInfo.codename.slice(1)}`,
            kernel: osInfo.kernel,
            arch: osInfo.arch,
            serial: osInfo.serial
        };

        staticSystemData.network = {
            ip4: network.ip4,
            ip4subnet: network.ip4subnet,
            gateway: networkGateway,
        }
        
        io.emit('socketStaticSystemData', staticSystemData);
        //console.log(staticSystemData);
    }
    catch(e){
        console.log(e);
    }
};


const getDynamicSystemData = async () => {
    try {
        let [time, cpu, memoryRAM, memoryDisk] = await Promise.all([si.time(), si.currentLoad(), si.mem(), si.fsSize()]);
        memoryDisk = memoryDisk[0];
        
        const dynamicSystemData = {};

        dynamicSystemData.time = {
            currentTime: new Date().toString().slice(0,24),
            uptime: new Date(time.uptime*1000).toISOString().substr(11, 8),
            timezone: time.timezone
        };
        
        dynamicSystemData.cpu = {
            currentLoad: cpu.currentLoad.toFixed(1) + "%",
            currentLoadUser: cpu.currentLoadUser.toFixed(1) + "%",
            currentLoadSystem: cpu.currentLoadSystem.toFixed(1) + "%"
        };
        
        dynamicSystemData.memoryRAM = {
            total: (memoryRAM.total/1024/1024).toFixed(1),
            active: (memoryRAM.active/1024/1024).toFixed(1),
            used: (memoryRAM.used/1024/1024).toFixed(1),
            activePercent: (100*memoryRAM.active/memoryRAM.total).toFixed(1) + "%"
        };
        
        dynamicSystemData.memoryDisk = {
            total: (memoryDisk.size/1024/1024).toFixed(1),
            used: (memoryDisk.used/1024/1024).toFixed(1),
            usedPercent: (100*memoryDisk.used/memoryDisk.size).toFixed(1) + "%"
        };
        
        io.emit('socketDynamicSystemData', dynamicSystemData);
        //console.log(dynamicSystemData);
    }
    catch(e){
        console.log(e);
    }
};

const getSensorData = () => {
    const valueAnalogA3 = 1.1;
    const valueAnalogA4 = 2.2;
    const valueAnalogA5 = 3.3;
    const valueAnalogA6 = 4.4;

    // Emitting a new message. Will be consumed by the client.
    io.emit('socketAnalogValues', {
        "analogA3": (valueAnalogA3*100).toFixed(1) + '%  ' + (1.8*valueAnalogA3).toFixed(3) + 'V',
        "analogA4": (valueAnalogA4*100).toFixed(1) + '%  ' + (1.8*valueAnalogA4).toFixed(3) + 'V',
        "analogA5": (valueAnalogA5*100).toFixed(1) + '%  ' + (1.8*valueAnalogA5).toFixed(3) + 'V',
        "analogA6": (valueAnalogA6*100).toFixed(1) + '%  ' + (1.8*valueAnalogA6).toFixed(3) + 'V'
    });
};
getStaticSystemData();
/*const ADS1115 = require('ads1115');
 
ADS1115.open(1, 0x48, 'i2c-bus').then(async (ads1115) => {
  ads1115.gain = 1
 
  for (let i = 0; i < 20; i++) {
    let x = await ads1115.measure('0+GND')
    let y = await ads1115.measure('1+GND')
    console.log("ADC0: " + x + "   ADC1: " + y)
  }
})*/