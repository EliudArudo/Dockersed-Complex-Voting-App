<template>
  <div class="splashscreen">
    <div class="welcome">
      <div class="welcome-body">
        <div class="welcome-text">
          <div>
            <span class="bigger-text primary--text">Welcome,</span>
            <br>
            <span>please wait as we set up</span>
          </div>
        </div>
        <div class="welcome-spinner">
          <Spinner color="#1976d2" size="7px"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import Spinner from "vue-spinner/src/BeatLoader.vue";

import { socket } from "@/connection/index.ts";

@Component({
  components: {
    Spinner
  }
})
export default class SplashScreen extends Vue {
  mounted() {
    // -> ws is the route to ws-server

    // get seed data here first
    socket.on("connect", () => {
      console.log("Voter connected to ws-server");
    });
    socket.on("seed-data", data => {
      console.log("seed-data just came through", { data });
      if (!data.data || data.data.length > 0) {
        this.$router.push({ name: "home", params: { data: data.data } });
      }
    });
  }
}
</script>

<style lang="scss">
.splashscreen {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome {
  // background: red;
  height: 250px;
  width: 250px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
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
