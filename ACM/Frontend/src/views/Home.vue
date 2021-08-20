<template>
    <h2>Hello {{ user }}, your authentication is {{ isAuthenticated }}</h2>
    <label class="switch">
      <input type="checkbox">
      <span class="slider round"></span>
    </label>
    <!-- Checked disabled switch -->
    <div class="form-switch">
      <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
      <label class="form-check-label" for="flexSwitchCheckDefault">Default switch checkbox input</label>
    </div>
    <div class="form-switch">
      <input class="form-check-input" type="checkbox" id="flexSwitchCheckCheckedDisabled" checked />
      <label class="form-check-label" for="flexSwitchCheckCheckedDisabled">On/Off</label>
    </div>
  
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
export default {
  setup(){
    const store = useStore();

    const user = computed(() => store.getters.getUser);
    const isAuthenticated = computed(() => store.getters.getAuthenticated);
    return {
      user,
      isAuthenticated,
    };
  },
};
</script>
<style>
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