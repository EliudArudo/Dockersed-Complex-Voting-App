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

        <AddCategory @clicked="clicked"/>
      </div>
      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <v-btn flat large color="primary">SUBMIT CHANGES</v-btn>
          <v-btn flat large color="error" @click="shutdownVotingProcess">SHUTDOWN VOTING PROCESS</v-btn>
        </div>
      </v-footer>
    </v-container>

    <v-dialog v-model="dialog" max-width="290" persistent>
      <Prompt :data="confirmData" @dismiss="dismiss" @confirm="confirm"/>
    </v-dialog>

    <v-dialog v-model="candidate_dialog" width="250" persistent>
      <UpdateCandidate :key="cheatcode" :candidateInfo="candidateInfo" @dismiss="candidateClosed"/>
    </v-dialog>
  </v-content>
</template>

<script>
/// Realistic data simulation
/// Refactor Cards into compontents
/// Add Login-Screen
/// Add prompt dialog ("Are you sure?")
/// Add message snackbars
/// Add Addition/Update input dialog
/// Data submission in voter-notification format
/// Add down button to scroll to add-card (Make it easy to scroll to add category card)

import { Component, Vue, Watch } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import Category from "@/components/Category.vue";
import AddCategory from "@/components/AddCategory.vue";
import Prompt from "@/components/Prompt.vue";
import UpdateCandidate from "@/components/UpdateCandidate.vue";

@Component({
  components: {
    HelloWorld,
    Category,
    AddCategory,
    Prompt,
    UpdateCandidate
  }
})
export default class Home extends Vue {
  selected = [2];

  alarmArray = [];
  notifications = [];

  dialog = false;
  candidate_dialog = false;
  cheatcode = 0;

  confirmData_ = null;
  candidateInfo_ = null;

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

  categories = [
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens A",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAcfsf",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAdfsd",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAdfdssw",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAdfsdyty",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAcbv",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens B",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAdfs",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAjgh",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAsad",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAasds",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAwer",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 900000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens C",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAhkg",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAip",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAzxc",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAzxcs",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAdfhd",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens D",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAjkl",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAfhf",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAfgh",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAfhgfg",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAfghf",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens E",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAxfs",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAsdfsd",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAqwe",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAsdfsd",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAklghj",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens F",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAqwe",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAxsd",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAcxvxc",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAcxv",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyAxcv",
          currentVotes: 400000
        }
      ]
    }
  ];

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

  mounted() {}

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
    console.log(data);
  }

  openPrompt(data) {
    this.confirmData = data;
    this.dialog = true;
  }

  alerter(id) {
    if (!this.alarmArray.includes(id)) {
      this.alarmArray.push(id);
    }
    const element = document.getElementById(id);

    element.style.boxShadow = "0 0 5px yellow";
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

        this.alerter(data.parentId);

        // Notificaiton is update with updated list of candidates
        this.notifications.push({
          category: this.categories[index].name,
          type: "update",
          candidates: this.categories[index].candidates
        });
      } else if (data.type === "category") {
        // No alert on parent here

        this.notifications.push({
          category: this.categories[index].name,
          type: "delete"
        });

        this.categories = this.categories.filter(
          item => JSON.stringify(item) !== JSON.stringify(data.parent)
        );
      }
    }
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
</style>
