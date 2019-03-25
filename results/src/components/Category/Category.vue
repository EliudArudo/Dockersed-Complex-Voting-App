<template>
  <div class="category" v-if="data">
    <div class="category-header primary--text">
      <div>
        <span>{{data.name}}</span>
      </div>

      <div class="ml-3 black--text total-category-votes">
        <span>{{humanize(data.currentVotes)}} votes</span>
      </div>

      <div class="ml-3">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <span v-on="on" class="error--text total-category-votes">{{data.currentPercentage}}%</span>
          </template>
          <span>of all categories' votes combined</span>
        </v-tooltip>
      </div>

      <div class="ml-3" :class="data.increase >= 0? 'success--text' : 'warning--text'">
        <v-icon
          :color="data.increase >= 0? 'success' : 'warning'"
        >{{data.increase >= 0? 'trending_up' : 'trending_down'}}</v-icon>
        <span class="total-category-votes">{{data.increase}}%</span>
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
