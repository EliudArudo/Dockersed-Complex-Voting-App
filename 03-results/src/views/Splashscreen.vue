<template>
  <div class="splashscreen">
    <div class="welcome">
      <v-progress-linear color="primary" height="2" indeterminate></v-progress-linear>
    </div>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

import { socket } from "../connection/index.ts";

@Component({
  components: {}
})
export default class SplashScreen extends Vue {
  mounted() {
    socket.on("connect", () => {
      console.log("RESULTS: Successfully connected to WS-SERVER");
    });

    socket.on("seed-data", data => {

      if (data.data.length > 0) {
        this.$router.push({ name: "home", params: { data: data.data } });
      }
    });
  }
}
</script>

<style lang="scss">
.splashscreen {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome {
  // background: red;
  height: 250px;
  width: 100%;
  display: flex;
  align-items: center;
}

.welcome-text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(43, 29, 29);
}

.welcome-body,
.welcome-text,
.welcome-spinner {
  width: 100%;
}

.welcome-text div {
  text-align: center;
}

.welcome-spinner {
  text-align: center;
}

.bigger-text {
  font-size: 33px;
  font-weight: 400;
}
</style>
