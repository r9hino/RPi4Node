<template>
  <div style="margin:0 auto" class="row col-md-8 my-4">
    <h5>Raspberry Gateway Data</h5>
    <table class="table table-striped table-hover table-borderless table-sm">
      <tbody>
        <tr>
          <td>Distro</td>
          <td>{{staticSystemData !== "" ? staticSystemData.osInfo.distro : ""}}</td>
        </tr>
        <tr>
          <td>Kernel</td>
          <td>{{staticSystemData !== "" ? staticSystemData.osInfo.kernel : ""}}</td>
        </tr>
        <tr>
          <td>Architecture</td>
          <td>{{staticSystemData !== "" ? staticSystemData.osInfo.arch : ""}}</td>
        </tr>
        <tr>
          <td>Node Version</td>
          <td>{{staticSystemData !== "" ? staticSystemData.osInfo.node : ""}}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.currentTime : ""}}</td>
        </tr>
        <tr>
          <td>Node Up Time</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.nodeUpTime : ""}}</td>
        </tr>
        <tr>
          <td>Raspberry Pi Up Time</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.rpiUpTime : ""}}</td>
        </tr>
        <tr>
          <td>Timezone</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.timezone : ""}}</td>
        </tr>
        <tr>
          <td>Gateway IP</td>
          <td>{{staticSystemData !== "" ? staticSystemData.network.gateway : ""}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="margin: 0 auto" class="row col-md-8 my-4">
    <h5>Raspberry OS Variables</h5>
    <table class="table table-striped table-hover table-borderless table-sm">
      <tbody>
        <tr>
          <td>CPU Total Load</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.cpu.currentLoad : ""}}</td>
        </tr>
        <tr>
          <td>CPU System Load</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.cpu.currentLoadSystem : ""}}</td>
        </tr>
        <tr>
          <td>CPU User Load</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.cpu.currentLoadUser : ""}}</td>
        </tr>
        <tr>
          <td>Total System RAM</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.memoryRAM.total + " MB": ""}}</td>
        </tr>
        <tr>
          <td>Active RAM</td>
          <td>{{dynamicSystemData !== "" ? `${dynamicSystemData.memoryRAM.active} MB (${dynamicSystemData.memoryRAM.activePercent})` : ""}}</td>
        </tr>
        <tr>
          <td>System Memory</td>
          <td>{{dynamicSystemData !== "" ? dynamicSystemData.memoryDisk.total + " MB" : ""}}</td>
        </tr>
        <tr>
          <td>Used Memory</td>
          <td>{{dynamicSystemData !== "" ? `${dynamicSystemData.memoryDisk.used} MB (${dynamicSystemData.memoryDisk.usedPercent})` : ""}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000', {autoConnect: false})

export default {
  name: 'systeminfo',
  components: {},
  props: [],
  data(){
    socket.on("socketStaticSystemData", data => {
      this.staticSystemData = data;
      console.log(data);
    });
    
    socket.on("socketDynamicSystemData", data => {
      this.dynamicSystemData = data;
      console.log(data);
    });

    return {
      staticSystemData: "",
      dynamicSystemData: "",
      delay: 5,
    };
  },
  methods: {
    isDefined(data, key) {
      if(data === undefined) return null;
      else return data[key];
    }
  },
  mounted(){
    socket.connect();
  },
  beforeUnmount(){
    socket.off("socketStaticSystemData");
    socket.off("socketDynamicSystemData");
    socket.disconnect();
  },
}
</script>