<template>
  <nav class="navbar navbar-expand navbar-custom">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="../assets/logo128.png" alt="" width="24" height="30">
      </a>
      <div class="navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="routerLink" to="/" @click="setToolActiveClass(false)">Home</router-link>
          </li>
          <!--<router-link class="routerLink" to="/process">Process</router-link>-->
          <li class="nav-item">
            <router-link class="routerLink" to="/calibration" @click="setToolActiveClass(false)">Calibration</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="dropdown-toggle routerLink" :style="{ color: isToolActive ? '#0a58ca':'#505050' }" href="#" id="dropdown" data-bs-toggle="dropdown" aria-expanded="false">Tools</a>
            <ul class="dropdown-menu" aria-labelledby="dropdown">
              <li><router-link class="routerLink" to="/systeminfo" @click="setToolActiveClass(true)">System Info</router-link></li>
              <li><router-link class="routerLink" to="/logs" @click="setToolActiveClass(true)">Logs</router-link></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue';

export default {
    name: "NavBar",
    setup(){
        let isToolActive = ref(false);
        let isShowDropdownActive = ref(false);

        let setToolActiveClass = (isToolsLink) => {
          if(isToolsLink === true){
            isToolActive.value = true;
            isShowDropdownActive.value = false;
          }
          else{
            isToolActive.value = false;
            isShowDropdownActive.value = false;
          }
        }

        return{
          isToolActive,
          isShowDropdownActive,
          setToolActiveClass,
        }
    }
}
</script>

<style>
.navbar{
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 45px !important;
}
.navbar-custom{
    background-color: #ddd;
    border-color: #c0c0c0;
}
.routerLink{
  padding: 0px 10px;
  color: #505050;
  font-weight: bold;
  text-decoration: none;
}
.router-link-active{
  color: #0a58ca;
}
</style>