<template>
  <div class="category" v-if="data">
    <div class="category-header primary--text">
      <div>
        <span>{{data.name}}</span>
      </div>

      <div class="ml-3 black--text total-category-votes">
        <transition name="slide-fade" mode="out-in">
          <span :key="data.currentVotes">{{humanize(data.currentVotes)}} votes</span>
        </transition>
      </div>

      <div class="ml-3">
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
          <span>of all categories' votes combined</span>
        </v-tooltip>
      </div>

      <div
        class="ml-3"
        :class="data.increase === 0? 'gray--text' : data.increase > 0? 'success--text' : 'warning--text'"
      >
        <v-icon
          v-if="data.increase !== 0"
          :color="data.increase > 0? 'success' : 'warning'"
        >{{data.increase >= 0? 'trending_up' : 'trending_down'}}</v-icon>

        <transition name="slide-fade" mode="out-in">
          <span :key="data.increase" class="total-category-votes">{{data.increase}}%</span>
        </transition>
      </div>
    </div>
    <div class="category-body">
      <Candidate
        v-for="(candidate,i) of data.candidates"
        :data="candidate"
        :key="ikey + 'candidate' + i"
      />
    </div>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import Candidate from "@/components/Category/Candidate.vue";

const numeral = require("numeral");

// load a locale
numeral.register("locale", "fr", {
  delimiters: {
    thousands: " ",
    decimal: "."
  },
  abbreviations: {
    thousand: "thousand",
    million: "million",
    billion: "billion",
    trillion: "trillion"
  },
  ordinal: function(number) {
    return number === 1 ? "er" : "ème";
  },
  currency: {
    symbol: "€"
  }
});

// switch between locales
numeral.locale("fr");

@Component({
  components: {
    Candidate
  },
  props: ["data", "ikey"]
})
export default class CategoryComponent extends Vue {
  humanize(number) {
    const format =
      number < 1000000
        ? number.toLocaleString()
        : numeral(number).format("0.0 a");

    return format;
  }
}
</script>

<style lang="scss">
</style>
