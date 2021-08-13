<template>
    <h2>Hello {{ user }}, your authentication is {{ isAuthenticated }}</h2>
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