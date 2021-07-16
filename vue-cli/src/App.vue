<template>
  <h1>{{ title }}</h1>
  <input type="text" ref="name">
  <button @click="handleClick">Click me</button>
  <Modal />
</template>

<script>
import Modal from './components/Modal.vue'

import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000')

export default {
  name: "App",
  components: { Modal },
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
    };
  },
  methods: {
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
  margin-top: 60px;
}
</style>
