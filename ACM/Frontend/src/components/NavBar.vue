<template>
  <nav class="navbar navbar-expand-sm navbar-custom">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="../assets/logo128.png" alt="" width="24" height="30">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <router-link class="routerLink" to="/">Home</router-link>
          <router-link class="routerLink" to="/process">Process</router-link>
          <router-link class="routerLink" to="/calibration">Calibration</router-link>
          <router-link class="routerLink" to="/systeminfo">System Info</router-link>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
    name: "NavBar",
    data() {
        return{
            isActiveProcess: true,
            isActiveCalibration: false,
            isActiveSystemInfo: false,
        }
    },
    methods: {
        activedProcess() {
            this.isActiveProcess = true
            this.isActiveCalibration = false
            this.isActiveSystemInfo = false
        },
        activedCalibration() {
            this.isActiveProcess = false
            this.isActiveCalibration = true
            this.isActiveSystemInfo = false
        },
        activedSystemInfo() {
            this.isActiveProcess = false
            this.isActiveCalibration = false
            this.isActiveSystemInfo = true
        }
    }
}
</script>

<style>
.navbar {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 45px !important;
}
.navbar-custom {
    background-color: #ddd;
    border-color: #c0c0c0;
}
.routerLink{
  padding: 0px 10px;
  color: #505050;
  font-weight: bold;
  text-decoration: none;
 }
</style>