<template>
  <div class="party" v-if="data">
    <div class="party-header">
      <span class="primary--text">{{data.name}}</span>
      <v-spacer></v-spacer>
      <span>
        <v-icon
          :color="data.increase >= 0? 'success' : 'warning'"
        >{{data.increase >= 0? 'trending_up' : 'trending_down'}}</v-icon>
        <span
          class="total-category-votes"
          :class="data.increase >= 0? 'success--text' : 'warning--text'"
        >{{data.increase}}%</span>
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
      <span class="bolder">{{data.currentVotes.toLocaleString()}} votes</span>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <span v-on="on" class="error--text total-category-votes">{{data.currentPercentage}}%</span>
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
export default class PartyComponent extends Vue {}
</script>

<style lang="scss">
</style>
