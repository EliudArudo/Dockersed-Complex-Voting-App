<template>
  <v-card>
    <v-card-title class="headline justify-center light-text grey--text">Are you sure?</v-card-title>

    <v-card-actions class="justify-center">
      <v-btn color="primary" flat="flat" @click="confirm">YES</v-btn>

      <v-btn color="error" flat="flat" @click="dismiss">NO</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["data"]
})
export default class PromptComponent extends Vue {
  confirm() {
    this.$emit("confirm", this.data);
  }

  dismiss() {
    this.$emit("dismiss");
  }
}
</script>

<style lang="scss">
</style>
