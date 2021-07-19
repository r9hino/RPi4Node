<template>
  <div id="nav">
    <router-link to="/">Process</router-link> | 
    <router-link to="/SystemInfo">System Info</router-link> | 
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
</template>

<script>
import io from 'socket.io-client'
const socket = io('http://rpi4id0.mooo.com:5000')

export default {
  components: {},
  data() {
    socket.on("connections", (data) => {
      connections.value = data;
      console.log(data);
    });

    socket.on("socketStaticSystemData", data => {
      this.staticSystemData = data;
      //this.$router.push({name: 'SystemInfo', params: {foo: this.staticSystemData}})
      console.log(data);
    });
    
    socket.on("socketDynamicSystemData", data => {
      this.dynamicSystemData = data;
      //this.$router.push({name: 'SystemInfo', params: {foo: this.staticSystemData}})
      console.log(data);
    });

    return {
      staticSystemData: {},
      dynamicSystemData: {}
    };
  },
  beforeMount() {
    socket.connect();
  },
  beforeUnmount() {
    socket.disconnect();
  },
  beforeUpdate() {
    //socket.disconnect();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
