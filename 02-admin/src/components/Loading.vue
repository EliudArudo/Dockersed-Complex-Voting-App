<template>
  <v-card>
    <v-card-text class="loading-card-text">
      <div>
        <div class="message-div pa-4 primary--text">
          <span>{{message}}</span>
        </div>
        <div class="loading-div">
          <Spinner color="#1976d2" size="7px"/>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import Spinner from "vue-spinner/src/BeatLoader.vue";

@Component({
  components: {
    Spinner
  },
  props: ["message"]
})
export default class LoadingComponent extends Vue {}
</script>

<style lang="scss">
.loading-div {
  text-align: center;
}

.message-div {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 300;
}
</style>
