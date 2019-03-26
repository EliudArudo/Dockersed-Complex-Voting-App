<template>
  <div class="home">
    <div class="main">
      <v-container>
        <Category
          v-for="(category, i) of categories"
          :data="category"
          :key="'category' + i"
          :ikey="'category' + i"
          class="mb-a"
        />

        <Category class="mb-a"/>

        <Category class="mb-a"/>
      </v-container>
    </div>
    <div class="side">
      <v-container>
        <Party
          class="mb-a"
          v-for="(party,i) of parties"
          :key="'party' + i"
          :data="party"
          :ikey="'party' + i"
        />

        <Party class="mb-a"/>

        <Party class="mb-a"/>
      </v-container>
    </div>

    <v-dialog persistent width="300" v-model="loading">
      <Loading :key="cheatcode" :message="loadingMessage"/>
    </v-dialog>

    <v-snackbar v-model="snackbar" top :timeout="timeout">{{snackbar_message}}</v-snackbar>
  </div>
</template>

<script>
import { Component, Vue, Watch } from "vue-property-decorator";

import Category from "@/components/Category/Category.vue";
import Party from "@/components/Party/Party.vue";

import Loading from "@/components/Loading.vue";

import { categories as cats } from "@/mock/index.ts";
import { categories } from "../../../admin/src/mock/data";

@Component({
  components: {
    Category,
    Party,
    Loading
  }
})
export default class Home extends Vue {
  categories = [];
  parties = [];

  loadingMessage = null;
  loading = false;
  cheatcode = 0;

  snackbar = false;
  snackbar_message = null;
  timeout = 3000;

  oldCategories = [];

  @Watch("loading")
  onLoadingChanged(val) {
    if (val) {
      this.cheatcode++;
    }
  }

  mounted() {
    // Mounted refreshes everything without newInfo
    this.refreshAllData(cats);

    setTimeout(() => {
      const pulse = {
        name: "Category A",
        currentVotes: 329500,
        candidates: [
          {
            name: "Jonathan Good",
            party: "Party D",
            picture: "https://picsum.photos/300/300?image=39",
            currentVotes: 8400 // 5000
          },
          {
            name: "Kate Middleton",
            party: "Party J",
            picture: "https://picsum.photos/300/300?image=25",
            currentVotes: 4304 // 2000
          },
          {
            name: "Quinter Rich",
            party: "Party X",
            picture: "https://picsum.photos/300/300?image=12",
            currentVotes: 2500 // 2500
          }
        ]
      };

      this.pulseProcessor(pulse);
    }, 3000);
  }

  refreshAllData(ncategories, oldCategories, oldParties) {
    this.parties = this.partyOps(ncategories, oldParties);
    this.categories = this.categoryOps(ncategories, oldCategories);
  }

  pulseProcessor(category) {
    // Category is category item
    let categoryManipulate = this.categories;

    const index = categoryManipulate.findIndex(
      item => item.name === category.name
    );

    if (index !== -1) {
      // categoryManipulate[index] = category;
      categoryManipulate[index].name = category.name;
      categoryManipulate[index].currentVotes = category.currentVotes;

      categoryManipulate[index].candidates = categoryManipulate[
        index
      ].candidates.map(person => {
        const index2 = category.candidates.findIndex(
          person2 =>
            person2.name === person.name && person2.party === person.party
        );

        if (index2 !== -1) {
          person.name = category.candidates[index2].name;
          person.currentVotes = category.candidates[index2].currentVotes;
        }

        return person;
      });
    }

    this.refreshAllData(
      categoryManipulate,
      this.cleanObject(this.categories),
      this.cleanObject(this.parties)
    );
  }

  cleanObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  startLoading(message) {
    this.loadingMessage = message;
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }

  openToast(message, timeout) {
    // Set to 0 to keep snackbar infinitely
    this.timeout = timeout;
    this.snackbar_message = message;
    this.snackbar = true;
  }

  // Helpers
  roundedToFixed(_float, _digits) {
    const rounder = Math.pow(10, _digits);
    return Number((Math.round(_float * rounder) / rounder).toFixed(_digits));
  }

  /// Data operations
  categoryOps(categoriesInput, oldCategories) {
    let newCategories = [];
    let cleanCategories = [];
    let filteredCategory;
    const totalPercentage = 0;

    const categorySum = categoriesInput.reduce(
      (total, it) => total + +it.currentVotes,
      0
    );

    cleanCategories = categoriesInput.map(item => {
      // Basic category info
      item["currentPercentage"] = item.currentPercentage
        ? item.currentPercentage
        : 0;
      item["increase"] = item.increase ? item.increase : 0;

      item.increase = this.roundedToFixed(item.increase, 1);

      item.currentPercentage = this.roundedToFixed(
        (item.currentVotes / categorySum) * 100,
        1
      );

      if (oldCategories) {
        filteredCategory = oldCategories.filter(
          item2 => item2.name === item.name
        );
        filteredCategory = filteredCategory[0];

        if (filteredCategory) {
          item.increase = this.roundedToFixed(
            +item.currentPercentage - +filteredCategory.currentPercentage,
            2
          );
        }
      }

      // Candidate info
      const candidateSum = item.candidates.reduce(
        (total, it) => total + +it.currentVotes,
        0
      );

      item.candidates = item.candidates.map(person => {
        person["currentPercentage"] = person.currentPercentage
          ? person.currentPercentage
          : 0;
        person["increase"] = person.increase ? person.increase : 0;

        person.increase = this.roundedToFixed(person.increase, 1);

        person.currentPercentage = this.roundedToFixed(
          (person.currentVotes / candidateSum) * 100,
          1
        );

        if (filteredCategory) {
          // Then there's old category
          let filteredCandidate = filteredCategory.candidates.filter(
            item2 => item2.name === person.name
          );
          filteredCandidate = filteredCandidate[0];

          if (filteredCandidate) {
            person.increase =
              person.currentPercentage - filteredCandidate.currentPercentage;

            person.increase = this.roundedToFixed(person.increase, 1);
          }
        }

        return person;
      });

      return item;
    });

    return cleanCategories;
  }

  partyOps(categoriesInput, oldParties) {
    let parties = [];

    let party_collection = [];
    for (const category of categoriesInput) {
      for (const candidate of category.candidates) {
        if (!party_collection.includes(candidate.party)) {
          party_collection.push(candidate.party);
        }
      }
    }

    let totalSum = 0;
    for (const party of party_collection) {
      let party_candidates = [];
      let sum = 0;

      for (const category of categoriesInput) {
        for (const candidate of category.candidates) {
          if (candidate.party === party) {
            party_candidates.push({
              name: candidate.name,
              category: category.name
            });

            sum += candidate.currentVotes;
            totalSum += candidate.currentVotes;
          }
        }
      }

      parties.push({
        name: party,
        currentVotes: sum,
        increase: 0,
        currentPercentage: 0, // Dealt with already
        candidates: party_candidates
      });
    }

    parties = parties.map(item => {
      item.currentPercentage = (item.currentVotes / totalSum) * 100;
      item.currentPercentage = this.roundedToFixed(item.currentPercentage, 1);

      if (oldParties) {
        let filteredParty = oldParties.filter(
          party => party.name === item.name
        );
        filteredParty = filteredParty[0];

        /// Increase refers to increase according to totalCategory
        if (filteredParty) {
          item.increase =
            item.currentPercentage - filteredParty.currentPercentage;
        }
      }

      item.increase = this.roundedToFixed(item.increase, 1);

      return item;
    });

    return parties;
  }
}
</script>

<style lang="scss">
.home {
  width: 100%;
  height: 100%;
}

.main,
.side {
  height: 100%;
  float: left;
}

.main {
  width: 70%;
}

.side {
  width: 30%;
  background: rgba(0, 0, 0, 0.007);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.category {
  width: 100%;
  min-height: 330px;
  background: 0 4px 2px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.category-header,
.category-body {
  width: 100%;
}

.category-header {
  height: 30px;
  font-size: 18px;
  font-weight: 300;
  // background: red;
  display: inline-flex;
  align-items: center;
}

.category-body {
  height: calc(100% - 30px);
  // background: green;
}

.candidate {
  width: 240px;
  height: 300px;
  text-align: center;
  float: left;
}

.text--right {
  text-align: right;
}

.total-category-votes {
  font-weight: 400;
  font-size: 15px;
}

.party {
  width: 100%;
}

.party-header,
.party-body,
.party-footer {
  width: 100%;
}

.party-header {
  display: inline-flex;
  align-items: center;
}

.party-footer {
  display: inline-flex;
}

.party-list {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0)
  ) !important;
}

.bolder {
  font-weight: 300;
}

.mb-a {
  // margin-botton altered
  margin-bottom: 40px;
}

@media (max-width: 850px) {
  .main {
    width: 100%;
  }

  .side {
    width: 100%;
    border-left: unset;
    background: transparent;
  }
}

@media (max-width: 600px) {
  .candidate {
    display: inline-block;
    float: unset;
  }

  .category-body {
    text-align: center;
  }
}
</style>

