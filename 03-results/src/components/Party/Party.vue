<template>
  <div class="party" v-if="data">
    <div class="party-header">
      <span class="primary--text">{{data.name}}</span>
      <v-spacer></v-spacer>
      <span>
        <v-icon
          :color="data.increase >= 0? 'success' : 'warning'"
        >{{data.increase >= 0? 'trending_up' : 'trending_down'}}</v-icon>

        <transition name="slide-fade" mode="out-in">
          <span
            :key="data.increase"
            class="total-category-votes"
            :class="data.increase >= 0? 'success--text' : 'warning--text'"
          >{{data.increase}}%</span>
        </transition>
      </span>
    </div>
    <div class="party-body">
      <v-list one-line class="party-list">
        <template v-for="(person,i) of data.candidates">
          <v-list-tile @click :key="ikey + 'party' + i">
            <v-list-tile-content>
              <v-list-tile-title>{{person.name}}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-content>
              <v-list-tile-sub-title class="text--right">{{person.category}}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider :key="ikey + i"></v-divider>
        </template>
      </v-list>
    </div>
    <div class="party-footer pa-2">
      <transition name="slide-fade" mode="out-in">
        <span
          class="bolder"
          :key="data.currentPercentage"
        >{{data.currentVotes.toLocaleString() + vote(data.currentVotes)}}</span>
      </transition>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <transition name="slide-fade" mode="out-in">
            <span
              v-on="on"
              :key="data.currentPercentage"
              class="error--text total-category-votes"
            >{{data.currentPercentage}}%</span>
          </transition>
        </template>
        <span>of all parties votes combined</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["data", "ikey"]
})
export default class PartyComponent extends Vue {
  vote(number) {
    return number === 1 ? " vote" : " votes";
  }
}
</script>

<style lang="scss">
</style>
