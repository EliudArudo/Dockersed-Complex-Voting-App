<template>
  <div class="splashscreen">{{test}}</div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class SplashScreen extends Vue {
  test = "dara dara";
}
</script>

<style lang="scss">
</style>
