const socket = io();
const { createApp, ref, watch, reactive, watchEffect } = Vue;

const App = {
  name: "App",

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
    };
  },
};

createApp(App).mount("#app");