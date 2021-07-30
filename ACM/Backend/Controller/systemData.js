const si = require('systeminformation');

const getStaticData = async () => {
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
        };

        // Return a promise.
        return staticSystemData;
    }
    catch(e){
        console.log(e);
    }
};


const getDynamicData = async () => {
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
            currentLoad: cpu.currentLoad == undefined ? null : cpu.currentLoad.toFixed(1) + "%",
            currentLoadUser: cpu.currentLoadUser == undefined ? null : cpu.currentLoadUser.toFixed(1) + "%",
            currentLoadSystem: cpu.currentLoadSystem == undefined ? null : cpu.currentLoadSystem.toFixed(1) + "%"
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

        // Return a promise.
        return dynamicSystemData;
    }
    catch(e){
        console.log(e);
    }
};

module.exports.getStaticData = getStaticData;
module.exports.getDynamicData = getDynamicData;