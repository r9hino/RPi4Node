<template>
    <h2>Hello {{ user }}, your authentication is {{ isAuthenticated }}</h2>
    <label class="switch">
      <input type="checkbox">
      <span class="slider round"></span>
    </label>
    <!-- Checked disabled switch -->
    <div class="form-switch" v-for="relay in relays" :key="relay.id">
      <input class="form-check-input" @change="onChangeSwitch(relay.id)" type="checkbox" :id="relay.id" :checked="relay.state" />
      <label class="form-check-label" for="flexSwitchCheckDefault">{{ relay.description }}</label>
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import io from 'socket.io-client'

const socket = io('http://rpi4id0.mooo.com:5000', {autoConnect: false}) // Avoid to connect when the application start. Do it manually.

export default {
  setup(){
    const store = useStore();
    let relays = ref([]);

    const user = computed(() => store.getters.getUser);
    const isAuthenticated = computed(() => store.getters.getAuthenticated);

    socket.on('resRelayStates', relay => {
      relays.value.push(...relay);
      console.log(relays.value);
    });

    // Listener in charge of updating element when other clients change it state.
    socket.on('updateClients', relay => {
      let id = relay.id;
      relays.value.[id] = relay;
      //console.log('updateClients:', relays.value.[id]);
    });

    let onChangeSwitch = (id) => {
      relays.value[id].state = !relays.value[id].state;
      //console.log(relays.value[id]);
      let relay = relays.value[id];
      socket.emit('elementChanged', relay);
    }

    onBeforeMount(() => {
      socket.connect();
      socket.emit('reqRelayStates');
    });
    onBeforeUnmount(() => {
      socket.off('resRelayStates');
      socket.off('updateClients');
      socket.disconnect();
    });

    return {
      user,
      isAuthenticated,
      relays,
      onChangeSwitch
    };
  }
};
</script>
<style>
  div.form-switch{
    margin: 10px 0px;
  }
  input.form-check-input{
    margin: 0px 0px;
    padding: 13px 30px;
  }
  .form-check-input:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  label.form-check-label{
    margin: 3px 10px;
  }
</style>