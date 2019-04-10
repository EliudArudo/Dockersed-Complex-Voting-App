<template>
  <v-card :id="cardID" class="category ma-2" width="300">
    <v-card-title primary-title>{{category.category}}</v-card-title>
    <v-card-text class="pt-0">
      <v-list two-line>
        <template v-for="(candidate, index) in category.candidates">
          <v-list-tile :key="index" avatar ripple @click="check(candidate)">
            <v-list-tile-avatar>
              <img :src="candidate.picture">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ candidate.name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{candidate.party}}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-list-tile-action>
                <v-btn icon>
                  <v-icon
                    :color="candidate.checked? 'primary' : 'grey lighten-1'"
                  >{{candidate.checked? 'check_circle_outline' : 'panorama_fish_eye'}}</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider v-if="index + 1 < category.candidates.length" :key="`divider-${index}`"></v-divider>
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
    this.category.candidates.forEach((item_inner, index, array) => {
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