<template>
  <NavBar v-if="isAuthenticated"/>
  <router-view/>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import NavBar from './components/NavBar.vue';

export default{
  components: { NavBar },
  setup(){
    const store = useStore();
    const isAuthenticated = computed(() => store.getters.getAuthenticated);
    return {isAuthenticated}
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
</style>
