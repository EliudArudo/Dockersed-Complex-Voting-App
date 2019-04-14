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

    <v-dialog v-model="final" width="400" persistent>
      <SubmitChangeDialog
        :key="cheatcode2"
        :changes="totalChanges"
        :categories="categories"
        @dismiss="dismiss"
      />
    </v-dialog>

    <v-btn
      @click="notifyChanges"
      v-if="totalChanges.length > 0"
      :disabled="notificationPlayback"
      fab
      dark
      color="primary"
      fixed
      bottom
      right
      class="changes-button fabs"
    >
      <v-icon dark>history</v-icon>
    </v-btn>

    <v-btn
      @click="openUpdatesDialog"
      v-if="totalChanges.length > 0"
      :disabled="notificationPlayback"
      fab
      color="white"
      fixed
      bottom
      right
      class="open-list-button fabs"
    >
      <v-icon color="primary">list</v-icon>
    </v-btn>
  </div>
</template>

<script>
// Incoming votes are inform of "Category object", then run this.pulseProcessor(categoryObject)
// Incoming UPDATES are inform of notification object , then run this.updateProcessor(updateObject);

import { Component, Vue, Watch } from "vue-property-decorator";

import Category from "@/components/Category/Category.vue";
import Party from "@/components/Party/Party.vue";

import Loading from "@/components/Loading.vue";
import SubmitChangeDialog from "@/components/SubmitChangeDialog.vue";

import { categories as cats } from "@/mock/index.ts";

import { socket } from "@/connection/index.ts";

@Component({
  components: {
    Category,
    Party,
    Loading,
    SubmitChangeDialog
  }
})
export default class Home extends Vue {
  categories = [];
  parties = [];

  loadingMessage = null;
  loading = false;
  cheatcode = 0;

  final = false;
  cheatcode2 = 0;

  snackbar = false;
  snackbar_message = null;
  timeout = 3000;

  oldCategories = [];

  totalChanges = [];
  notificationPlayback = false;

  @Watch("loading")
  onLoadingChanged(val) {
    if (val) {
      this.cheatcode++;
    }
  }

  @Watch("final")
  onFinalChanged(val) {
    if (val) {
      this.cheatcode2++;
    }
  }

  mounted() {
    // Mounted refreshes everything without newInfo

    const data = this.$route.params.data;
    this.refreshAllData(data);

    socket.on("update", data => {
      if (data.type === "notification") {
        this.updateProcessor(data.data);
      } else if (data.type === "pulse") {
        this.pulseProcessor(data.data);
      }
    });

    socket.on("seed-data", data => {
      if (!data.data || data.data.length === 0) {
        this.$router.push({ name: "splashscreen" });
      }
    });

    //  --------- UNCOMMENT TO START INCOMING VOTES LIVE UPDATES ------
    // setTimeout(() => {
    //   const pulse = { // Example of update object
    //     name: "Category A",
    //     currentVotes: 329500,
    //     candidates: [
    //       {
    //         name: "Jonathan Good",
    //         party: "Party D",
    //         picture: "https://picsum.photos/300/300?image=39",
    //         currentVotes: 8400 // 5000
    //       },
    //       {
    //         name: "Kate Middleton",
    //         party: "Party J",
    //         picture: "https://picsum.photos/300/300?image=25",
    //         currentVotes: 4304 // 2000
    //       },
    //       {
    //         name: "Quinter Rich",
    //         party: "Party X",
    //         picture: "https://picsum.photos/300/300?image=12",
    //         currentVotes: 2500 // 2500
    //       }
    //     ]
    //   };

    //   this.pulseProcessor(pulse); // Production user formulae
    // }, 3000);

    // [0, 1, 2, 3, 4].forEach((number, index) => {
    //   setTimeout(() => {
    //     this.updatesSimulation(number);
    //   }, 5000 * (number + 1));
    // });
    //  --------- UNCOMMENT TO START INCOMING VOTES LIVE UPDATES ------
  }

  // Notifications + Loaders
  startLoading(message) {
    this.loadingMessage = message;
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }

  openToast(message, timeout = 3000) {
    // Set to 0 to keep snackbar infinitely
    this.timeout = timeout;
    this.snackbar_message = message;
    this.snackbar = true;
  }

  notifyChanges() {
    this.notificationPlayback = true;

    this.totalChanges.forEach((item, index, array) => {
      setTimeout(() => {
        this.openToast(item.message);

        if (index === array.length - 1) {
          this.notificationPlayback = false;
        }
      }, (this.timeout + 500) * index);
    });
  }

  // Dialog Work

  openUpdatesDialog() {
    this.final = true;
  }

  dismiss() {
    this.final = false;
  }

  // Helpers
  roundedToFixed(_float, _digits) {
    const rounder = Math.pow(10, _digits);
    return Number((Math.round(_float * rounder) / rounder).toFixed(_digits));
  }

  cleanObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /// Data operations
  refreshAllData(ncategories, oldCategories, oldParties) {
    this.parties = this.partyOps(ncategories, oldParties);
    this.categories = this.categoryOps(ncategories, oldCategories);
  }

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
      item["originalName"] = item.originalName ? item.originalName : item.name;

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

        /// If current Percentages are same, then it's a minor update
        if (
          filteredCategory &&
          filteredCategory.currentPercentage !== item.currentPercentage
        ) {
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

        if (isNaN(person.currentPercentage)) {
          person.currentPercentage = 0;
        }

        if (filteredCategory) {
          // Then there's old category
          let filteredCandidate = filteredCategory.candidates.filter(
            item2 => item2.name === person.name
          );
          filteredCandidate = filteredCandidate[0];

          if (
            filteredCandidate &&
            filteredCandidate.currentPercentage !== person.currentPercentage
          ) {
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

      let existing = -1;
      let toBePushed = {
        name: party,
        currentVotes: sum,
        candidates: party_candidates
      };

      if (oldParties) {
        existing = oldParties.findIndex(item => item.name === party);
      }

      if (existing === -1) {
        toBePushed["increase"] = 0;
        toBePushed["currentPercentage"] = 0; // Dealt with already
      } else {
        toBePushed.increase = oldParties[existing].increase;
        toBePushed.currentPercentage = oldParties[existing].currentPercentage;
      }

      parties.push(toBePushed);
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
        if (
          filteredParty &&
          item.currentPercentage !== filteredParty.currentPercentage
        ) {
          item.increase =
            item.currentPercentage - filteredParty.currentPercentage;
        }
      }

      item.increase = this.roundedToFixed(item.increase, 2);

      return item;
    });

    return parties;
  }

  // Data Update processors
  pulseProcessor(category) {
    // Category is category item
    const frozenCategories = this.cleanObject(this.categories);
    const frozenParties = this.cleanObject(this.parties);

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

    this.refreshAllData(categoryManipulate, frozenCategories, frozenParties);
  }

  updatesSimulation(index) {
    const add = {
      // New category
      category: "Category U",
      type: "add",
      candidates: [
        {
          name: "Jojo Vallet",
          picture: "https://picsum.photos/300/300?image=54",
          party: "Party N"
        },
        {
          name: "Velma Martins",
          picture: "https://picsum.photos/300/300?image=77",
          party: "Party Y"
        }
      ]
    };
    const update1 = {
      // testing adding of new candidates
      category: "Category F",
      type: "update",
      candidates: [
        {
          name: "Elisha Hunterman",
          party: "Party J",
          picture: "https://picsum.photos/300/300?image=45"
        },
        {
          name: "Lois Strongman",
          party: "Party D",
          picture: "https://picsum.photos/300/300?image=54"
        },
        {
          name: "Racheal Daiety",
          party: "Party X",
          picture: "https://picsum.photos/300/300?image=12"
        },
        {
          name: "Angella Dimmick",
          picture: "https://picsum.photos/300/300?image=235",
          party: "Party N"
        },
        {
          name: "Lang Gouveia",
          picture: "https://picsum.photos/300/300?image=10",
          party: "Party Y"
        }
      ]
    };

    const update2 = {
      // testing removal of candidates
      category: "Category F",
      type: "update",
      candidates: [
        {
          name: "Elisha Hunterman",
          party: "Party J",
          picture: "https://picsum.photos/300/300?image=45"
        },
        {
          name: "Racheal Daiety",
          party: "Party X",
          picture: "https://picsum.photos/300/300?image=12"
        },
        {
          name: "Lang Gouveia",
          picture: "https://picsum.photos/300/300?image=10",
          party: "Party Y"
        }
      ]
    };

    const nameupdate = {
      category: "Category Q",
      type: "update",
      newName: "Category Qi"
    };

    const deleteC = {
      category: "Category X",
      type: "delete"
    };

    const updateArrays = ["add", "update1", "update2", "nameupdate", "deleteC"];
    this.updateProcessor(eval(updateArrays[index]));
  }

  updateProcessor(update) {
    /// Category added
    //  update = { category: 'name', type: 'add', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}
    //
    /// Category deleted
    //  update = { category: 'name', type: 'delete' }
    //
    /// Category name changed
    //  update = { category: 'name', type: 'update', newName: 'name' }
    //
    /// Candidate modified -> Includes candidates removed or added
    //  update = { category: 'name', type: 'update', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}

    let updateType;
    let modifiedCategory;
    let newCandidates;

    if (update.type === "add") {
      updateType = "CategoryADD";
    } else if (update.type === "delete") {
      updateType = "CategoryDELETE";
    } else if (update.type === "update" && update.newName) {
      updateType = "CategoryNAMEUPDATE";
    } else if (update.type === "update" && !update.newName) {
      updateType = "CategoryUPDATE"; // candidates added or removed
    } else {
      // No change not documented should be let through;
      return;
    }

    // Common variables for operations below
    /// frozen before directtly assigning this

    const frozenCategories = this.cleanObject(this.categories);
    const frozenParties = this.cleanObject(this.parties);

    let categoryManipulate = this.cleanObject(this.categories);

    const index = categoryManipulate.findIndex(
      item => item.name === update.category
    );

    // switch statement
    switch (updateType) {
      case "CategoryADD":
        modifiedCategory = {};
        modifiedCategory["name"] = update.category;
        modifiedCategory["currentVotes"] = 0; // start with 0

        modifiedCategory["candidates"] = update.candidates;
        modifiedCategory.candidates = modifiedCategory.candidates.map(
          person => {
            person["currentVotes"] = 0;
            return person;
          }
        );

        categoryManipulate.push(modifiedCategory);

        break;
      case "CategoryUPDATE":
        // After index rational checker
        if (index !== -1) {
          // Add candidates not in current categories but in update
          for (const person of update.candidates) {
            const presentIndex = categoryManipulate[index].candidates.findIndex(
              candidate => {
                return (
                  candidate.name === person.name &&
                  candidate.party === person.party
                );
              }
            );

            if (presentIndex === -1) {
              // If not found, add to categories
              categoryManipulate[index].candidates.push({
                name: person.name,
                party: person.party,
                picture: person.picture,
                currentVotes: 0
              });
            }
          }

          // Remove candidates not in update but in current categories
          for (const person of categoryManipulate[index].candidates) {
            const presentIndex = update.candidates.findIndex(candidate => {
              return (
                candidate.name === person.name &&
                candidate.party === person.party
              );
            });

            if (presentIndex === -1) {
              // If not found, remove from current categories
              categoryManipulate[index].candidates = categoryManipulate[
                index
              ].candidates.filter(
                person2 =>
                  !(
                    person.name === person2.name &&
                    person.party === person2.party
                  )
              );
            }
          }
        }

        break;
      case "CategoryNAMEUPDATE":
        categoryManipulate[index].name = update.newName;
        break;
      case "CategoryDELETE":
        categoryManipulate = categoryManipulate.filter(
          item => item.name !== update.category
        );

        break;
    }

    /// Final changes here
    this.startLoading("Applying changes");
    this.refreshAllData(
      categoryManipulate,
      frozenCategories, // should freeze objects here
      frozenParties // should freeze objects here
    );

    setTimeout(() => {
      this.notificationProcessor(update);
      this.stopLoading();
    }, 3000);
  }

  notificationProcessor(data) {
    let message;
    switch (data.type) {
      case "add":
        message = `${this.capitalize(data.category)} category added with ${
          data.candidates.length
        } candidates`;
        break;
      case "update":
        if (data.newName) {
          message = `${this.capitalize(data.category)} category is now ${
            data.newName
          }`;
        } else {
          message = `Candidate list updated for ${this.capitalize(
            data.category
          )} category`;
        }
        break;
      case "delete":
        message = `${this.capitalize(data.category)} category removed`;
        break;
    }

    // this.totalChanges.push(message);
    this.totalChanges.push({
      category: data.category,
      message
    });
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

.changes-button {
  bottom: 120px !important;
}

.fabs {
  opacity: 0.4;
}

.fabs:hover {
  opacity: 1;
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

