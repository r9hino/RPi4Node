<template>
  <NavBar />

  <h1>{{ title }}</h1>
  <p>Welcome...</p>
  <input type="text" ref="name">
  <button @click="handleClick">Click me</button>
  <div v-if="showModal">
    <Modal :header="header" :text="text" theme="sale" @close="toggleModal">
      <h1>Ninja Giveaway!</h1>
      <p>Grab your ninja</p>
      <template v-slot:links>
        <a href="#">Sign up now</a>
        <a href="#">More info</a>
      </template>
    </Modal>
  </div>
  <button @click="toggleModal">Open modal</button>
  
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
                <td>Date</td>
                <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.currentTime : ""}}</td>
              </tr>
              <tr>
                <td>Uptime</td>
                <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.uptime : ""}}</td>
              </tr>
              <tr>
                <td>Timezone</td>
                <td>{{dynamicSystemData !== "" ? dynamicSystemData.time.timezone : ""}}</td>
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
                <td>CPU User Load</td>
                <td>{{dynamicSystemData !== "" ? dynamicSystemData.cpu.currentLoadUser : ""}}</td>
              </tr>
              <tr>
                <td>CPU System Load</td>
                <td>{{dynamicSystemData !== "" ? dynamicSystemData.cpu.currentLoadSystem : ""}}</td>
              </tr>
              <tr>
                <td>System RAM</td>
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
        <div style="margin: 0 auto" class="row col-md-8 my-4">
          <h5>Raspberry Conectivity</h5>
          <table class="table table-striped table-hover table-borderless table-sm">
            <tbody>
              <tr>
                <td>Raspberry IP</td>
                <td>{{staticSystemData !== "" ? staticSystemData.network.ip4 : ""}}</td>
              </tr>
              <tr>
                <td>Gateway IP</td>
                <td>{{staticSystemData !== "" ? staticSystemData.network.gateway : ""}}</td>
              </tr>
              <tr>
                <td>Connection Type</td>
                <td>{{staticSystemData !== "" ? staticSystemData.network.type : ""}}</td>
              </tr>
              <tr>
                <td>Interface</td>
                <td>{{staticSystemData !== "" ? staticSystemData.network.iface : ""}}</td>
              </tr>
            </tbody>
          </table>
        </div>

</template>

<script>
import NavBar from './components/NavBar.vue'
import Modal from './components/Modal.vue'

import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000')

export default {
  name: "App",
  components: { NavBar, Modal },
  data() {
    socket.on("connections", (data) => {
      connections.value = data;
      console.log(data);
    });

    socket.on("socketStaticSystemData", data => {
      this.staticSystemData = data;
      console.log(data);
    });
    
    socket.on("socketDynamicSystemData", data => {
      this.dynamicSystemData = data;
      console.log(data);
    });
    
    socket.on("socketAnalogValues", data => {
      this.analogSensorValues = data;
      console.log(data);
    });

    return {
      staticSystemData: {},
      dynamicSystemData: {},
      analogSensorValues: {},
      test: "Hello",
      ready: true,
      title: 'My first Vue app',
      header: "Sign up",
      text: "Grab your ninja!",
      showModal: false
    };
  },
  methods: {
    toggleModal() {
      this.showModal = !this.showModal;
    },
    handleClick() {
      console.log(this.$refs.name)
      this.$refs.name.classList.add('active')
      this.$refs.name.focus()
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
linkStyle {
    color: '#afafaf';
    textDecoration: 'none';
    marginRight: '15px';
}
</style>
