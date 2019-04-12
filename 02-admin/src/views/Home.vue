<template>
  <v-content>
    <v-container class="home pl-0 pr-0 mr-5 ml-5">
      <div class="notification-bar">
        <span class="title primary--text">ADMIN'S LOUNGE</span>
      </div>
      <div class="body">
        <Category
          v-for="(category, index) of categories"
          :category="category"
          :key="'category' + index"
          :ikey="'category' + index"
          :id="'category' + index"
          @clicked="clicked"
        />

        <AddCategory id="add-card" @clicked="clicked"/>
      </div>

      <v-btn
        dark
        fab
        color="primary"
        fixed
        bottom
        right
        class="scroll-down-btn"
        @click="scrollToAdd()"
      >
        <v-icon>keyboard_arrow_down</v-icon>
      </v-btn>

      <v-btn
        :loading="loading4"
        dark
        fab
        color="white"
        fixed
        bottom
        right
        class="refresh-btn"
        @click="refresh()"
      >
        <v-icon color="primary">refresh</v-icon>

        <template v-slot:loader>
          <span class="custom-loader">
            <v-icon light>cached</v-icon>
          </span>
        </template>
      </v-btn>

      <v-btn dark fab color="error" fixed bottom right class="logout-btn" to="/">
        <v-icon>exit_to_app</v-icon>
      </v-btn>

      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <v-btn flat large color="primary" @click="submitAll">SUBMIT CHANGES</v-btn>
          <v-btn
            flat
            large
            :color="votingShutdown? 'success': 'error'"
            @click="votingProcess(!votingShutdown)"
          >{{votingShutdown? 'START VOTING PROCESS' : 'SHUTDOWN VOTING PROCESS'}}</v-btn>
        </div>
      </v-footer>
    </v-container>

    <v-dialog v-model="dialog" max-width="290" persistent>
      <Prompt :data="confirmData" @dismiss="dismiss" @confirm="confirm"/>
    </v-dialog>

    <v-dialog v-model="candidate_dialog" width="250" persistent>
      <UpdateCandidate
        @notify="openToast"
        :key="cheatcode"
        :candidateInfo="candidateInfo"
        @dismiss="candidateClosed"
      />
    </v-dialog>

    <v-dialog v-model="category_name" width="250" persistent>
      <CategoryName
        :key="cheatcode2"
        :data="categoryNameSend"
        :allCategories="categories"
        @notify="openToast"
        @dismiss="categoryNameClosed"
      />
    </v-dialog>

    <v-dialog v-model="final" width="400" persistent>
      <SubmitChangeDialog
        :key="cheatcode3"
        :changes="totalChanges"
        :categories="categories"
        @restore="restoreCategory"
        @dismiss="finalChanges"
      />
    </v-dialog>

    <v-snackbar v-model="snackbar" top left :timeout="3000">
      {{snackbar_message}}
      <v-btn color="primary" flat @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-snackbar v-model="shutdownDialog" top left :timeout="0">
      Shutting down in {{shutDownCountDown}}
      <v-btn color="primary" flat @click="stopShutDown">STOP</v-btn>
    </v-snackbar>

    <v-dialog v-model="loading" width="300" persistent>
      <Loading :message="loadingMessage"/>
    </v-dialog>
  </v-content>
</template>

<script>
// Incoming votes are inform of "Category object", then run this.pulseProcessor(Category)

// On Submitting changes, on success, we'll receive an entire "Categories Object" -> All our categories, from where we can start again
// Updated "Categories Object" is what RESULTS will get also
// Client will get just the changes needed -> From admin's change object in notification format

// All requests to server should have tokens with them

import { Component, Vue, Watch } from "vue-property-decorator";

import * as _ from "lodash";

import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import Category from "@/components/Category.vue";
import AddCategory from "@/components/AddCategory.vue";
import Prompt from "@/components/Prompt.vue";
import UpdateCandidate from "@/components/UpdateCandidate.vue";
import CategoryName from "@/components/CategoryName.vue";
import SubmitChangeDialog from "@/components/SubmitChangeDialog.vue";
import Loading from "@/components/Loading.vue";

import { categories, originalcategories } from "@/mock/data.ts";

import TopComponent from "vue-class-component";

import * as axios from "axios";

import { socket } from "@/connection/index.ts";

TopComponent.registerHooks([
  "beforeRouteEnter",
  "beforeRouteLeave",
  "beforeRouteUpdate" // for vue-router 2.2+
]);

@Component({
  components: {
    HelloWorld,
    Category,
    AddCategory,
    Prompt,
    UpdateCandidate,
    CategoryName,
    SubmitChangeDialog,
    Loading
  }
})
export default class Home extends Vue {
  selected = [2];

  totalChanges = [];

  alarmArray = [];
  notifications = [];

  dialog = false;
  loading = false;
  candidate_dialog = false;
  cheatcode = 0;
  cheatcode2 = 0;
  cheatcode3 = 0;

  category_name = false;

  confirmData_ = null;
  candidateInfo_ = null;

  categoryNameSend_ = null;

  snackbar = false;
  snackbar_message_ = null;

  loadingMessage_ = null;

  loader = null;
  loading4 = false;

  final = false;

  token = null;

  votingShutdown = true;
  shutdownDialog = false;
  shutDownTimer = null;
  shutDownCountDown = 10;
  shutdowntime = 9;

  votingSimulator = null;

  get loadingMessage() {
    return this.loadingMessage_;
  }

  set loadingMessage(val) {
    this.loadingMessage_ = val;
  }
  get snackbar_message() {
    return this.snackbar_message_;
  }

  set snackbar_message(val) {
    this.snackbar_message_ = val;
  }

  get confirmData() {
    return this.confirmData_;
  }

  set confirmData(val) {
    this.confirmData_ = val;
  }

  get candidateInfo() {
    return this.candidateInfo_;
  }

  set candidateInfo(val) {
    this.candidateInfo_ = val;
  }

  get categoryNameSend() {
    return this.categoryNameSend_;
  }

  set categoryNameSend(val) {
    this.categoryNameSend_ = val;
  }

  categories = [];
  backup_categories = [];

  @Watch("shutdownDialog")
  onShuttingDown(val) {
    if (val) {
      this.shutDownTimer = setInterval(() => {
        this.shutDownCountDown = this.shutdowntime;
        this.shutdowntime--;

        if (this.shutdowntime === 0) {
          clearInterval(this.shutDownTimer);
          /// Change status
          setTimeout(() => {
            this.shutdown();
          }, 2000);
        }
      }, 2000);
    } else {
      this.shutdowntime = 9;
      this.shutDownCountDown = 10;
    }
  }

  @Watch("loader")
  loaderChanged() {
    const l = this.loader;
    this[l] = !this[l];

    setTimeout(() => (this[l] = false), 3000);

    this.loader = null;
  }

  @Watch("token")
  tokenChanged(val) {
    if (!val) {
      this.$router.push({ name: "login" });
    }
  }

  @Watch("notifications", { deep: true })
  onNotificationChanged(val) {
    // console.log("Notifications changed", val);
  }

  @Watch("candidate_dialog")
  onCandidateDialogOpened(val) {
    if (val) {
      this.cheatcode++;
    } else {
      this.candidateInfo = null;
    }
  }

  @Watch("final")
  onFinalDialogOpened(val) {
    if (val) {
      this.cheatcode3++;
    }
  }

  @Watch("category_name")
  onCategoryNameDialogOpened(val) {
    if (val) {
      this.cheatcode2++;
    } else {
      this.categoryNameSend = null;
    }
  }

  @Watch("alarmArray")
  onAlarmArrayUpdated(val, oldVal) {
    oldVal.forEach(id => {
      this.removeaalert(id);
    });

    setTimeout(() => {
      val.forEach(id => {
        this.alerter(id);
      });
    }, 1000);
  }

  beforeRouteEnter(to, from, next) {
    //// Do out testing of credentials here to server before entering
    const allowed = true; /// variable of truth

    if (allowed) {
      next();
    } else {
      next("/");
    }
  }

  mounted() {
    // this.categories = JSON.parse(JSON.stringify(categories));
    // this.backup_categories = JSON.parse(JSON.stringify(categories));

    this.categories = JSON.parse(JSON.stringify(this.$route.params.data));
    this.backup_categories = JSON.parse(
      JSON.stringify(this.$route.params.data)
    );

    this.token = this.$route.params.token;

    this.categories = this.categories.map(item => {
      item.originalName = item.name;

      item.candidates = item.candidates.map(person => {
        person.originalName = person.name;
        return person;
      });

      return item;
    });

    socket.on("update", data => {
      console.log(`'${data.type} update just came in'`, { data });
      if (data) {
        this.pulseProcessor(data.data);
      }
    });

    //  --------- UNCOMMENT TO START INCOMING VOTES LIVE UPDATES ------
    // setInterval(() => {
    //   /// user this.pulseProcessor(category) in PROD
    //   this.streamSimulator();
    // }, 5000);
    //  --------- UNCOMMENT TO START INCOMING VOTES LIVE UPDATES ------
  }

  startLoading(message) {
    this.loadingMessage = message;
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }

  /// USED IN PRODUCTION

  pulseProcessor(pulse) {
    // 'pulse' is a category object with new changes
    // Looks for category and candidate and updates respectively
    // No notifications here

    const categoryIndex = this.categories.findIndex(
      item => item.name.toLowerCase() === pulse.name.toLowerCase()
    );

    const backupCategoryIndex = this.backup_categories.findIndex(
      item => item.name.toLowerCase() === pulse.name.toLowerCase()
    );

    if (categoryIndex === -1) {
      // Check if it exists in backup, so we can update backup

      if (backupCategoryIndex === -1) {
        // Hardly, because since it's coming in, the backup should have it
        return;
      }

      this.backup_categories[backupCategoryIndex].currentVotes = JSON.parse(
        JSON.stringify(pulse.currentVotes)
      );
      /// Because update object contains Category as a whole
      /// Just mutating whole backup candidate objects
      this.backup_categories[backupCategoryIndex].candidates = JSON.parse(
        JSON.stringify(pulse.candidates)
      );
      // Meaning the category has been deleted
      // Backgound and silent operation
      return;
    }

    /// If category is found

    /// All magic happens here
    this.categories[categoryIndex].currentVotes = pulse.currentVotes;

    pulse.candidates.forEach(item => {
      let candidateIndex = this.categories[categoryIndex].candidates.findIndex(
        person => person.originalName === item.name
      );

      if (candidateIndex !== -1) {
        // If Candidate is in Current List of Categories, definitely in Backup
        // Change in Current List of Categories and Backup categories
        this.categories[categoryIndex].candidates[candidateIndex].currentVotes =
          item.currentVotes;

        /// Imported from simulator
        this.backupUpdator(
          {
            index: categoryIndex,
            currentVotes: this.categories[categoryIndex].currentVotes
          },
          {
            index: candidateIndex,
            currentVotes: this.categories[categoryIndex].candidates[
              candidateIndex
            ].currentVotes
          }
        );

        this.pulseAlert(`category${categoryIndex}`);

        setTimeout(() => {
          this.pulseAlert(`category${categoryIndex}card${candidateIndex}`);
        }, 300);

        console.log(`'${this.categories[categoryIndex].name}' updated`);

        /// Imported from simulator
      } else {
        // If candidate is not in current Categories but in Backup (SHOULD BE THERE)
        // Change in Backup categories
        candidateIndex = this.backup_categories[
          backupCategoryIndex
        ].candidates.findIndex(person => person.name === item.name);

        /// Just update directly
        this.backup_categories[backupCategoryIndex].candidates[
          candidateIndex
        ] = JSON.parse(JSON.stringify(item));

        /// ---  No alerts after update
      }
    });
  }

  pulseAlert(id) {
    const element = document.getElementById(id);

    const prevShadow = element.style.boxShadow;

    element.style.boxShadow = "0 0 10px #1976d2";

    setTimeout(() => {
      // List item
      element.style.boxShadow = prevShadow;
    }, 2000);
  }

  backupUpdator(category, candidate) {
    // category and candidate have {index: '', currentVotes: ''}

    const trueCategoryIndex = this.backup_categories.findIndex(
      inner_category =>
        inner_category.name === this.categories[category.index].originalName
    );
    const trueCandidateIndex = this.backup_categories[
      trueCategoryIndex
    ].candidates.findIndex(
      person =>
        person.name ===
        this.categories[category.index].candidates[candidate.index].originalName
    );

    this.backup_categories[trueCategoryIndex].currentVotes =
      category.currentVotes;
    this.backup_categories[trueCategoryIndex].candidates[
      trueCandidateIndex
    ].currentVotes = candidate.currentVotes;
  }

  /// USED IN PRODUCTION

  //// Simulators - REMOVED IN PRODUCTION
  streamSimulator() {
    const categorySize = this.categories.length - 1;

    const randomCategoryNumber = this.generateRandomInteger(0, categorySize);

    const candidateSize =
      this.categories[randomCategoryNumber].candidates.length - 1;

    const randomCandidateNumber = this.generateRandomInteger(0, candidateSize);

    const randomVoteIncrement = this.generateRandomInteger(1, 100);

    /// Check if category or candidate exists in backup, if not, run this again
    const categoryInBackup =
      this.backup_categories.findIndex(
        item => item.name === this.categories[randomCategoryNumber].originalName
      ) !== -1;

    let candidateInBackup = false;
    if (this.backup_categories[randomCategoryNumber]) {
      candidateInBackup =
        this.backup_categories[randomCategoryNumber].candidates.findIndex(
          person =>
            person.name ===
            this.categories[randomCategoryNumber].candidates[
              randomCandidateNumber
            ].originalName
        ) !== -1;
    }

    /// Return everything until you get both
    if (!categoryInBackup || !candidateInBackup) {
      return;
    }

    // Update category first
    this.categories[randomCategoryNumber].currentVotes += randomVoteIncrement;
    // Then update candidate
    this.categories[randomCategoryNumber].candidates[
      randomCandidateNumber
    ].currentVotes += randomVoteIncrement;

    /// Cut off here
    this.backupUpdator(
      {
        index: randomCategoryNumber,
        currentVotes: this.categories[randomCategoryNumber].currentVotes
      },
      {
        index: randomCandidateNumber,
        currentVotes: this.categories[randomCategoryNumber].candidates[
          randomCandidateNumber
        ].currentVotes
      }
    );

    this.pulseAlert(`category${randomCategoryNumber}`);

    setTimeout(() => {
      this.pulseAlert(
        `category${randomCategoryNumber}card${randomCandidateNumber}`
      );
    }, 300);

    console.log(`'${this.categories[randomCategoryNumber].name}' updated`);
  }

  generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }
  //// Simulators - REMOVED IN PRODUCTION

  openToast(message) {
    this.snackbar_message = message;
    this.snackbar = true;
  }

  toggle(index) {
    const i = this.selected.indexOf(index);

    if (i > -1) {
      this.selected.splice(i, 1);
    } else {
      this.selected.push(index);
    }
  }

  clicked(data) {
    if (data.action === "delete") {
      this.openPrompt(data);
      return;
    }

    if (data.type === "candidate") {
      this.openCandidate(data);
    }

    if (data.type === "category" && data.action === "add") {
      this.category_name = true;
    }

    if (data.type === "category" && !data.item && data.action === "update") {
      // Meaning it's category name change
      this.categoryNameSend = data;
      this.category_name = true;
    }
  }

  openPrompt(data) {
    this.confirmData = data;
    this.dialog = true;
  }

  alerter(id) {
    const element = document.getElementById(id);

    element.style.boxShadow = "0 0 5px yellow";
  }

  removeaalert(id) {
    const element = document.getElementById(id);
    if (element) {
      if (!id.includes("card")) {
        element.style.boxShadow =
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)";
        return;
      }
      element.style.boxShadow = "none";
    }
  }

  startShutDown() {
    this.shutdownDialog = true;
  }

  stopShutDown() {
    clearInterval(this.shutDownTimer);
    this.shutdownDialog = false;
  }

  shutdown() {
    console.log("Voting Process shut down");
    // Send signal to clear all databases, everything goes back to 0;
    this.shutdownDialog = false;
    this.votingShutdown = true;

    // /// DEVELOPMENT PURPOSES
    // clearInterval(this.votingSimulator);
    // /// DEVELOPMENT PURPOSES
    this.$router.push({ name: "login" });
  }

  start() {
    console.log("Voting Process start");
    this.openToast("Voting process started");
    this.votingShutdown = false;
    // Sends signal to everyone, and now votes are allowed to come in

    /// DEVELOPMENT PURPOSES
    this.votingSimulator = setInterval(() => {
      /// user this.pulseProcessor(category) in PROD
      this.streamSimulator();
    }, 5000);
    /// DEVELOPMENT PURPOSES
  }

  confirm(data) {
    //// Confirmed
    this.dialog = false;

    if (data.action === "delete") {
      const index = this.categories.findIndex(
        item => JSON.stringify(item) === JSON.stringify(data.parent)
      );

      if (data.type === "candidate") {
        // Show alert on parent

        this.categories[index].candidates = this.categories[
          index
        ].candidates.filter(
          item => JSON.stringify(item) !== JSON.stringify(data.item)
        );

        /// Subtract the votes
        this.categories[index].currentVotes -= data.item.currentVotes;

        // Notificaiton is update with updated list of candidates
        this.notificationsPush({
          category: this.categories[index].originalName,
          type: "update",
          candidates: this.categories[index].candidates
        });

        this.alarmArray = this.alarmArray.filter(item => item !== data.itemId);

        if (!this.alarmArray.includes(data.parentId)) {
          this.alarmArray.push(data.parentId);
        }
      } else if (data.type === "category") {
        // No alert on parent here

        this.notificationsPush({
          category: this.categories[index].originalName,
          type: "delete"
        });

        this.alarmArray = this.alarmArray.filter(
          item => item !== data.parentId
        );

        this.categories = this.categories.filter(
          item => JSON.stringify(item) !== JSON.stringify(data.parent)
        );
      }
    } else if (data.action === "add") {
      if (data.type === "candidate") {
        const index = this.categories.findIndex(
          item => JSON.stringify(item) === JSON.stringify(data.parent)
        );

        this.categories[index].candidates.push(data.item);

        // No need to add, since candidate starts at 0;

        const lastIndex = this.categories[index].candidates.length - 1;

        this.notificationsPush({
          category: this.categories[index].originalName,
          type: "update",
          candidates: this.categories[index].candidates
        });

        setTimeout(() => {
          if (!this.alarmArray.includes(data.parentId)) {
            this.alarmArray.push(data.parentId);
          }

          if (!this.alarmArray.includes(`${data.parentId}card${lastIndex}`)) {
            this.alarmArray.push(`${data.parentId}card${lastIndex}`);
          }
        }, 300);
      }
    } else if (data.action === "update") {
      if (data.type === "candidate") {
        const index = this.categories.findIndex(
          item => JSON.stringify(item) === JSON.stringify(data.parent)
        );

        const index2 = this.categories[index].candidates.findIndex(
          item => JSON.stringify(item) === JSON.stringify(data.oldItem)
        );

        // this.categories[index].candidates[index2] = data.item;

        const candidate = this.categories[index].candidates[index2];

        for (const key in candidate) {
          candidate[key] = data.item[key];
        }

        this.notificationsPush({
          category: this.categories[index].originalName,
          type: "update",
          candidates: this.categories[index].candidates
        });

        setTimeout(() => {
          if (!this.alarmArray.includes(data.parentId)) {
            this.alarmArray.push(data.parentId);
          }

          if (!this.alarmArray.includes(`${data.parentId}card${index2}`)) {
            this.alarmArray.push(`${data.parentId}card${index2}`);
          }
        }, 300);
      }
    }

    axios.default.defaults.headers.common["Authorization"] = `bearer ${
      this.token
    }`;

    if (data.shutdown === true) {
      axios
        .default({
          method: "post",
          url: "/manager/admin-in",
          data: { shutdown: data.shutdown }
        })
        .then(() => {
          this.stopLoading();
          this.startShutDown();
        })
        .catch(e => {
          this.stopLoading();
          console.log(e);
          this.openToast(e.response ? e.response.data : e);
        });
    } else if (data.shutdown === false) {
      // this.start(); -> Was for simulation purposes
      // If false - do nothing, just unlock and start
      axios
        .default({
          method: "post",
          url: "/manager/admin-in",
          data: { shutdown: data.shutdown }
        })
        .then(() => {
          this.stopLoading();
          this.start();
        })
        .catch(e => {
          this.stopLoading();
          console.log(e);
          this.openToast(e.response ? e.response.data : e);
        });
    }
  }

  notificationsPush(data) {
    this.notifications.push(data);
  }

  dismiss() {
    this.dialog = false;
  }

  openCandidate(candidateData) {
    // Assign props here
    this.candidateInfo = candidateData;
    this.candidate_dialog = true;
  }

  candidateClosed(e) {
    this.candidate_dialog = false;

    if (e) {
      this.confirm(e);
    }
  }

  categoryNameClosed(e) {
    this.category_name = false;

    if (!e) {
      return;
    }

    if (e.data) {
      const index = this.categories.findIndex(
        item => JSON.stringify(item) === JSON.stringify(e.data.parent)
      );

      this.notificationsPush({
        category: this.categories[index].originalName,
        type: "update",
        newName: e.name
      });

      this.categories[index].name = e.name;

      if (!this.alarmArray.includes()) {
        this.alarmArray.push(`category${index}`);
      }
      return;
    }
    //// Category without people should not be added

    this.categories.push({
      name: e.name,
      currentVotes: 0,
      candidates: [],
      originalName: e.name
    });

    const index = this.categories.length - 1;
    setTimeout(() => {
      if (!this.alarmArray.includes(`category${index}`)) {
        this.alarmArray.push(`category${index}`);
      }
    }, 1000);
  }

  scrollToAdd() {
    const target = document.getElementById("add-card");
    this.$vuetify.goTo(target, {
      duration: 1000,
      offset: 0,
      easing: "easeInOutCubic"
    });
  }

  refresh() {
    this.loader = "loading4";

    this.notifications = [];
    this.alarmArray = [];
    this.totalChanges = [];
    this.categories = [];

    this.categories = JSON.parse(JSON.stringify(this.backup_categories));

    this.categories = this.categories.map(item => {
      item.originalName = item.name;

      item.candidates = item.candidates.map(person => {
        person.originalName = person.name;
        return person;
      });

      return item;
    });
  }

  submitAll() {
    if (this.notifications.length === 0) {
      this.openToast("No changes to be applied");
      return;
    }

    this.notifications.forEach((data, index, array) => {
      const change = this.notificationProcessor(data);

      if (change) {
        this.totalChanges.push(change);
      }

      if (index === array.length - 1) {
        this.final = true;
      }
    });
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

  restoreCategory(category) {
    // Notifications changed

    this.notifications = this.notifications.filter(
      notifications => notifications.category !== category
    );
    // Total Changes processed already
    let indexTop = this.categories.findIndex(
      it => it.originalName === category
    );

    let originalIndex = this.backup_categories.findIndex(
      it => it.name === category
    );

    ///// no-restored - meaning it's not it original-categories
    if (originalIndex === -1) {
      // Meaning it was a new category
      this.categories = this.categories.filter(
        item => item.originalName !== category
      );
      this.openToast("New categories are not added to original data");
      return;
    }
    ////

    const restored = JSON.parse(
      JSON.stringify(this.backup_categories[originalIndex])
    );
    ///// On delete, no alarm array
    if (indexTop === -1) {
      restored.originalName = restored.name;
      this.categories.push({ ...restored });
    }
    /////

    this.alarmArray.forEach((item, index, array) => {
      if (item.toLowerCase().includes(`category${indexTop}`)) {
        this.removeaalert(item);
        this.alarmArray = this.alarmArray.filter(it => it !== item);
      }

      if (index === array.length - 1) {
        // Restore actual category
        // If name does not exist, do something

        this.categories[indexTop] = { ...restored };
      }
    });
  }

  finalChanges(e) {
    this.final = false;
    this.totalChanges = [];
    if (e) {
      this.startLoading("Submitting your final changes");
      axios
        .default({
          method: "post",
          url: "/manager/admin-in",
          data: { notifications: this.notifications }
        })
        .then(() => {
          this.stopLoading();
          this.openToast("Thanks, Patriot!!!");
        })
        .catch(e => {
          this.stopLoading();
          console.log(e);
          this.openToast(e.response ? e.response.data : e);
        });
    }
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  votingProcess(status) {
    this.openPrompt({ shutdown: status });
  }
}
</script>


<style lang="scss">
.home {
  height: 100%;
  width: 100%;
  padding-bottom: 150px !important;
}

.submit-area {
  min-height: 70px !important;
  background-color: white !important;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  height: unset !important;
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-items {
  height: 100%;
  text-align: center;
}

.notification-bar,
.body {
  width: 100%;
}

.notification-bar {
  height: 60px;
  // background-color: yellow;
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px !important;
  font-weight: 300;
}

.notification-bar span {
  height: 100%;
}

.body {
  height: calc(100% - 60px);
  // background-color: red;
  text-align: center;
}

.v-card__actions {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.light-text {
  font-weight: 300;
}

.candidate {
  height: 200px;
  width: 100%;
}

.candidate-image {
  width: 100%;
  // height: 100%;
  float: left;
  display: flex;
  align-items: center;
  justify-content: center;
}

.candidate-info {
  width: 100%;
  // height: 100%;
  float: left;
  box-sizing: border-box;
  padding: 0 10px;
}

.candidate-image .v-avatar {
  overflow: hidden;
}

.candidate-image .v-avatar img {
  width: unset !important;
}

.candidate-avatar {
  transition: all 0.3s ease;
}

.candidate-avatar:hover {
  transform: scale(1.1);
}

.candidate-avatar:active {
  transform: scale(1);
}

.full-width {
  width: 100%;
}

.clickable {
  cursor: pointer;
}

.logout-btn {
  bottom: 150px !important;
}

.scroll-down-btn {
  bottom: 250px !important;
}

.refresh-btn {
  bottom: 350px !important;
}

.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
