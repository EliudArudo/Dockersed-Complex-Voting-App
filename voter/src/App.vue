<template>
  <v-app class="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      //
    };
  }
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  overflow: auto;
}

.application--wrap {
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 1),
    rgba(239, 239, 239, 1)
  );
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 2px #1976d244;
  background-color: #f5f5f5;
}

::-webkit-scrollbar {
  width: 2px;
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background-color: #1976d2;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>

