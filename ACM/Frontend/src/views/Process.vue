<template>
  <h1>Homepage</h1><h1>{{ title }}</h1>
  <p>{{ this.$route}}</p>
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
</template>

<script>
import Modal from '../components/Modal.vue'

import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000')

export default {
  components: { Modal },
  data() {
    socket.on("connections", (data) => {
      connections.value = data;
      console.log(data);
    });

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
    toggleModal() {
      this.showModal = !this.showModal;
    },
    handleClick() {
      console.log(this.$refs.name)
      this.$refs.name.classList.add('active')
      this.$refs.name.focus()
    }
  },
  beforeMount() {
    socket.connect();
  },
  beforeUnmount() {
    socket.disconnect();
  },
};
</script>
