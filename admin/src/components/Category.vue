<template>
  <v-card width="290" class="category-card">
    <v-card-title class="pb-0 clickable">
      <span @click="click('category', 'update', null, category, ikey, null)">{{category.name}}</span>
      <v-spacer></v-spacer>
      <span class="light-grey">{{humanize(category.currentVotes)}} votes</span>
    </v-card-title>

    <v-list three-line>
      <template v-for="(candidate, index) in category.candidates">
        <v-list-tile
          :id="ikey + 'card' + index"
          :key="ikey + index"
          avatar
          ripple
          @click="itemClicked"
        >
          <v-list-tile-avatar>
            <img :src="candidate.picture">
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-sub-title class="text--primary">{{candidate.name}}</v-list-tile-sub-title>
            <v-list-tile-sub-title class="text--primary">{{candidate.party}}</v-list-tile-sub-title>
            <v-list-tile-sub-title
              class="green-text"
            >{{isNaN(Math.round((candidate.currentVotes / category.currentVotes) * 100))? '0%' : Math.round((candidate.currentVotes / category.currentVotes) * 100) + '%'}}</v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-icon
              class="item-icons"
              color="error"
              @click="click('candidate', 'delete', candidate, category, ikey, (ikey + 'card' + index))"
            >highlight_off</v-icon>
            <v-icon
              class="item-icons"
              color="grey"
              @click="click('candidate', 'update', candidate, category, ikey, (ikey + 'card' + index))"
            >settings</v-icon>
            <v-list-tile-action-text>{{candidate.currentVotes.toLocaleString()}} votes</v-list-tile-action-text>
          </v-list-tile-action>
        </v-list-tile>
        <v-divider :key="index"></v-divider>
      </template>

      <v-list-tile class="add-button">
        <v-list-tile-action>
          <v-btn
            flat
            large
            color="primary"
            @click="click('candidate', 'add', null, category, ikey)"
          >ADD CANDIDATE</v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-card-actions>
      <v-btn flat icon color="error" @click="click('category', 'delete', null, category, ikey)">
        <v-icon>highlight_off</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
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
  props: ["category", "ikey"]
})
export default class CategoryComponent extends Vue {
  humanize(number) {
    const format =
      number < 1000000
        ? number.toLocaleString()
        : numeral(number).format("0.0 a");

    return format;
  }

  itemClicked() {
    // Do nothing
  }

  click(type, action, item, parent, parentId, itemId) {
    const data = {
      type, // canditate // category
      action, // delete // update
      item, // real item to modify
      parent,
      parentId,
      itemId
    };

    this.$emit("clicked", data);
  }
}
</script>

<style lang="scss">
.item-icons {
  font-size: 18px !important;
  padding-bottom: 3px;
  transition: all 0.2s linear;
}

.item-icons:hover {
  transform: scale(1.2);
  color: red !important;
}

.item-icons:active {
  transform: scale(1);
  color: white !important;
}

.v-list__tile__action--stack {
  justify-content: center !important;
}

.category-card {
  display: inline-block;
  margin: 10px;
  vertical-align: top;
}
</style>