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

      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <v-btn flat large color="primary" @click="submitAll">SUBMIT CHANGES</v-btn>
          <v-btn flat large color="error" @click="shutdownVotingProcess">SHUTDOWN VOTING PROCESS</v-btn>
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

    <v-snackbar v-model="snackbar" top left :timeout="3000">
      {{snackbar_message}}
      <v-btn color="primary" flat @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-content>
</template>

<script>
/// Realistic data simulation
/// Refactor Cards into compontents - Add Category Card
/// Add Login-Screen
/// Add message snackbars
/// Add Add Category input dialog
/// Data submission in voter-notification format
/// Add down button to scroll to add-card (Make it easy to scroll to add category card)

import { Component, Vue, Watch } from "vue-property-decorator";

import * as _ from "lodash";

import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import Category from "@/components/Category.vue";
import AddCategory from "@/components/AddCategory.vue";
import Prompt from "@/components/Prompt.vue";
import UpdateCandidate from "@/components/UpdateCandidate.vue";
import CategoryName from "@/components/CategoryName.vue";

import { categories } from "@/mock/data.ts";

@Component({
  components: {
    HelloWorld,
    Category,
    AddCategory,
    Prompt,
    UpdateCandidate,
    CategoryName
  }
})
export default class Home extends Vue {
  selected = [2];

  totalChanges = [];

  alarmArray = [];
  notifications = [];

  dialog = false;
  candidate_dialog = false;
  cheatcode = 0;
  cheatcode2 = 0;

  category_name = false;

  confirmData_ = null;
  candidateInfo_ = null;

  categoryNameSend_ = null;

  snackbar = false;
  snackbar_message_ = null;

  loader = null;
  loading4 = false;

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

  @Watch("loader")
  loaderChanged() {
    const l = this.loader;
    this[l] = !this[l];

    setTimeout(() => (this[l] = false), 3000);

    this.loader = null;
  }

  @Watch("notifications", { deep: true })
  onNotificationChanged(val) {
    console.log("Notifications changed", val);
  }

  @Watch("candidate_dialog")
  onCandidateDialogOpened(val) {
    if (val) {
      this.cheatcode++;
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
    console.log("AlarmArray updates", val);

    oldVal.forEach(id => {
      this.removeaalert(id);
    });

    setTimeout(() => {
      val.forEach(id => {
        this.alerter(id);
      });
    }, 1000);
  }

  mounted() {
    this.categories = [...categories];
    // console.log(categories);
  }

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
      element.style.boxShadow = "none";
    }
  }

  confirm(data) {
    //// Confirmed
    console.log(data);
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

        // Notificaiton is update with updated list of candidates
        this.notificationsPush({
          category: this.categories[index].name,
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
          category: this.categories[index].name,
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

        const lastIndex = this.categories[index].candidates.length - 1;

        this.notificationsPush({
          category: this.categories[index].name,
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
          category: this.categories[index].name,
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
    console.log(e);
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
        category: this.categories[index].name,
        type: "update",
        newName: e.name
      });

      this.categories[index].name = e.name;

      if (!this.alarmArray.includes(`category${index}`)) {
        this.alarmArray.push(`category${index}`);
      }
      return;
    }
    //// Category without people should not be added

    this.categories.push({
      name: e.name,
      currentVotes: 0,
      candidates: []
    });

    const index = this.categories.length - 1;
    // console.log(index);
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
    this.totalChanges = [];
    this.categories = [];
    this.categories = [...categories];
  }

  submitAll() {
    console.log(this.notifications);
    if (this.notifications.length === 0) {
      this.openToast("No changes to be applied");
      return;
    }

    this.notifications.forEach((data, index, array) => {
      console.log(data);

      const change = this.notificationProcessor(data);

      if (change) {
        this.totalChanges.push(change);
      }

      if (index === array.length - 1) {
        console.log(this.totalChanges);
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

    this.totalChanges.push(message);
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  shutdownVotingProcess() {
    this.openPrompt({ shutdown: true });
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

.scroll-down-btn {
  bottom: 150px !important;
}

.refresh-btn {
  bottom: 240px !important;
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
