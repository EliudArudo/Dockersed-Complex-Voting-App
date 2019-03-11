<template>
  <v-card :id="cardID" class="category ma-2" width="300">
    <v-card-title primary-title>Category</v-card-title>
    <v-card-text class="pt-0">
      <v-list two-line>
        <template v-for="(item, index) in category">
          <v-list-tile :key="index" avatar ripple @click="check(item)">
            <v-list-tile-avatar>
              <img src="https://cdn.vuetifyjs.com/images/lists/1.jpg">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-list-tile-action>
                <v-btn icon>
                  <v-icon
                    :color="item.checked? 'primary' : 'grey lighten-1'"
                  >{{item.checked? 'check_circle_outline' : 'panorama_fish_eye'}}</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider v-if="index + 1 < category.length" :key="`divider-${index}`"></v-divider>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>                

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["category", "cardID"]
})
export default class Category extends Vue {
  check(item) {
    this.category.forEach((item_inner, index, array) => {
      item_inner.checked = false;
      if (index === array.length - 1) {
        item.checked = !item.checked;
      }
    });
  }
}
</script>

<style>
</style>