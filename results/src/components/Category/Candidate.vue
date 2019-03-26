<template>
  <v-card class="candidate pa-3 ma-2" v-if="data">
    <v-avatar :size="100">
      <img :src="data.picture" alt="avatar">
    </v-avatar>

    <v-list two-line>
      <v-list-tile @click>
        <v-list-tile-content>
          <v-list-tile-title>{{data.name}}</v-list-tile-title>
          <v-list-tile-sub-title>{{data.party}}</v-list-tile-sub-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <transition name="slide-fade" mode="out-in">
            <span
              :key="data.currentPercentage"
              class="candidate-percentage warning--text"
            >{{data.currentPercentage}}%</span>
          </transition>
        </v-list-tile-action>
      </v-list-tile>

      <v-divider :key="34"></v-divider>

      <v-list-tile @click>
        <v-list-tile-content>
          <transition name="slide-fade" mode="out-in">
            <v-list-tile-sub-title
              :key="data.currentVotes"
            >{{data.currentVotes.toLocaleString()}} votes</v-list-tile-sub-title>
          </transition>
        </v-list-tile-content>
        <v-list-tile-content>
          <transition name="slide-fade" mode="out-in">
            <v-list-tile-sub-title
              :key="data.increase"
              class="text--right"
              :class="data.increase === 0? 'gray--text' : data.increase > 0? 'success--text' : 'warning--text'"
            >
              <v-icon
                v-if="data.increase !== 0"
                :color="data.increase > 0? 'success' : 'warning'"
              >{{data.increase >= 0? 'trending_up' : 'trending_down'}}</v-icon>
              {{data.increase}}%
            </v-list-tile-sub-title>
          </transition>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["data"]
})
export default class CandidateComponent extends Vue {}
</script>

<style lang="scss">
.candidate-percentage {
  font-size: 15px;
  font-weight: 400;
}
</style>
