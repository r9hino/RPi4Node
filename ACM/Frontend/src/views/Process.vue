<template>
  <h1>Homepage</h1><h1>{{ title }}</h1>
  
  <router-link v-if="!isAuthenticated" to="/login"><button>Login</button></router-link>
  
  <p>{{this.$route}}</p>
  <input type="text" ref="name">
  <button @click="handleClick">Click me</button>
</template>

<script>
import {mapGetters, useStore} from "vuex"

import Modal from '../components/Modal.vue'

import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000')


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
    ...mapGetters(['isAuthenticated'])
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
