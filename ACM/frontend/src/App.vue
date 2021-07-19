<template>
  <!--<div id="nav">
    <router-link to="/">Process</router-link> | 
    <router-link to="/SystemInfo">System Info</router-link> | 
    <router-link to="/about">About</router-link>
  </div>
  -->
  <NavBar/>
  <router-view/>
</template>

<script>
import NavBar from './components/NavBar.vue'
export default {
  components: { NavBar },
  data() {
    return {}
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
