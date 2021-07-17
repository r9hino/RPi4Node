<template>
  <nav class="navbar navbar-expand-sm navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="../assets/logo128.png" alt="" width="24" height="27">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <a class="nav-link" :class="{active: isActiveProcess}" @click="activedProcess" aria-current="page" href="#">Process</a>
          <a class="nav-link" :class="{active: isActiveCalibration}" @click="activedCalibration" href="#">Calibration</a>
          <a class="nav-link" :class="{active: isActiveSystemInfo}" @click="activedSystemInfo" href="#">System info</a>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
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
</style>