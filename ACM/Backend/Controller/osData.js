const si = require('systeminformation');
const process = require('process');

const getStaticData = async () => {
    try {
        let [osInfo, network, networkGateway] = await Promise.all([si.osInfo(), si.networkInterfaces(), si.networkGatewayDefault()]);
        network = network[0];

        const staticSystemData = {};

        staticSystemData.osInfo = {
            distro: `${osInfo.distro.slice(0,6)} ${osInfo.release} - ${osInfo.codename.charAt(0).toUpperCase() + osInfo.codename.slice(1)}`,
            kernel: osInfo.kernel,
            arch: osInfo.arch,
            node: process.version,
            serial: osInfo.serial,
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
        console.error('ERROR:', e);
    }
};

const getDynamicData = async () => {
    try {
        let time = await si.time();
        let cpu = await si.currentLoad();
        let memoryRAM = await si.mem();
        let memoryDisk = await si.fsSize();
        memoryDisk = memoryDisk[0];

        const dynamicSystemData = {};
        const nodeUpTime = process.uptime();

        let nodeSec = nodeUpTime%60;
        let nodeMin = ((nodeUpTime - nodeSec)/60)%60;
        let nodeHr = ((nodeUpTime - nodeSec - nodeMin*60)/60/60)%24;
        let nodeDays = (nodeUpTime - nodeSec - nodeMin*60 - nodeHr*60*60)/60/60/24;

        let rpiSec = time.uptime%60;
        let rpiMin = ((time.uptime - rpiSec)/60)%60;
        let rpiHr = ((time.uptime - rpiSec - rpiMin*60)/60/60)%24;
        let rpiDays = (time.uptime - rpiSec - rpiMin*60 - rpiHr*60*60)/60/60/24;

        dynamicSystemData.time = {
            currentTime: new Date().toString().slice(0,24),
            nodeUpTime: `${nodeDays} days  -  ${nodeHr} hr  -  ${nodeMin} min  -  ${nodeSec.toFixed(0)} sec`,
            rpiUpTime: `${rpiDays} days  -  ${rpiHr} hr  -  ${rpiMin} min  -  ${rpiSec.toFixed(0)} sec`,
            timezone: time.timezone
        };

        dynamicSystemData.cpu = {
            currentLoad: cpu.currentLoad == undefined ? null : cpu.currentLoad.toFixed(1) + "%",
            currentLoadUser: cpu.currentLoadUser == undefined ? null : cpu.currentLoadUser.toFixed(1) + "%",
            currentLoadSystem: cpu.currentLoadSystem == undefined ? null : cpu.currentLoadSystem.toFixed(1) + "%"
        };

        dynamicSystemData.memoryRAM = {
            total: memoryRAM.total == undefined ? null : (memoryRAM.total/1024/1024).toFixed(1),
            active: memoryRAM.active  == undefined ? null : (memoryRAM.active/1024/1024).toFixed(1),
            used: memoryRAM.used  == undefined ? null : (memoryRAM.used/1024/1024).toFixed(1),
            activePercent: memoryRAM.active/memoryRAM.total  == undefined ? null : (100*memoryRAM.active/memoryRAM.total).toFixed(1) + "%"
        };

        dynamicSystemData.memoryDisk = {
            total: memoryDisk.size  == undefined ? null : (memoryDisk.size/1024/1024).toFixed(1),
            used: memoryDisk.used  == undefined ? null : (memoryDisk.used/1024/1024).toFixed(1),
            usedPercent: memoryDisk.used/memoryDisk.size  == undefined ? null : (100*memoryDisk.used/memoryDisk.size).toFixed(1) + "%"
        };

        // Return a promise.
        return dynamicSystemData;
    }
    catch(e){
        console.error('ERROR:', e);
    }
};

module.exports.getStaticData = getStaticData;
module.exports.getDynamicData = getDynamicData;