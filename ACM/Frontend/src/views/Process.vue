<template>
  <h1>Homepage</h1><h1>{{ title }}</h1>
  
  <p>{{this.$route}}</p>
  <input type="text" ref="name">
  <button @click="handleClick">Click me</button>
</template>

<script>
import {mapGetters, useStore} from "vuex"
import io from 'socket.io-client'

import Modal from '../components/Modal.vue'

const socket = io('http://rpi4id0.mooo.com:5000', {autoConnect: false}) // Avoid to connect when the application start. Do it manually.

export default {
  components: { Modal },
  data(){
    socket.on("socketAnalogValues", data => {
      this.analogSensorValues = data;
      console.log(data);
    });

    return {
      analogSensorValues: {},
      title: 'My first Vue app',
      header: "Sign up",
      text: "Grab your ninja!",
      showModal: false
    };
  },
  methods: {

  },
  computed: {
    ...mapGetters(['getAuthenticated'])
  },
  beforeMount(){
    socket.connect();
  },
  beforeUnmount(){
    socket.off("socketAnalogValues");
    socket.disconnect();
  },
  unmounted(){
  },
};
</script>
