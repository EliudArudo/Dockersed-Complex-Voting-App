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

@Component({
  components: {
    Spinner
  }
})
export default class SplashScreen extends Vue {
  mounted() {
    setTimeout(() => {
      this.$router.push({ name: "home" });
    }, 4000);
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
