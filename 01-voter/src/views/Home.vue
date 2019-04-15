<template>
  <v-content>
    <v-container class="home">
      <div class="notification-bar">
        <div class="notification" id="select">
          <v-select
            :items="items_notification"
            label="Notifications"
            solo
            @input="openNotification"
            id="select"
          ></v-select>
        </div>
      </div>
      <div class="body-area">
        <CategoryCard
          :category="category"
          v-for="(category, i) in categories"
          :cardID="'card'+(i+1)"
          :key="'card' + i"
        />
      </div>

      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <div class="input">
            <v-text-field
              v-model="id"
              :rules="inputRules"
              label="Your id number"
              ref="id_input"
              required
            ></v-text-field>
          </div>
          <div class="button">
            <v-btn
              class="pa-0"
              flat
              large
              color="primary"
              :loading="loadingBtn"
              :disabled="loadingBtn"
              @click="vote"
            >VOTE</v-btn>
          </div>
        </div>
      </v-footer>

      <v-snackbar v-model="snackbar" top left :timeout="3000">
        {{snackbar_message}}
        <v-btn color="primary" flat @click="snackbar = false">Close</v-btn>
      </v-snackbar>

      <v-dialog v-model="loading" persistent width="250">
        <v-card>
          <v-card-text>
            <div class="full-width text-xs-center">
              <div class="full-width pb-3 pt-3">
                <span class="primary--text big-text">Changes&nbsp;</span>
                <br>
                <span>are being applied, please wait...</span>
              </div>
              <div class="full-width pb-2 pt-2">
                <Spinner color="#1976d2" size="7px"/>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-content>
</template>

<script>
/// Notifications
/// Category added
/// { category: 'name', type: 'add', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}
/// Category deleted
/// { category: 'name', type: 'delete' }
/// Category name changed
/// { category: 'name', type: 'update', newName: 'name' }
/// Candidate modified -> Includes candidates removed or added
/// { category: 'name', type: 'update', candidates: [{name: 'name', picture: 'picture', party: 'party'}, {name: 'name', picture: 'picture', party: 'party'}]}

import { Component, Vue, Watch } from "vue-property-decorator";

import * as axios from "axios";

import Spinner from "vue-spinner/src/BeatLoader.vue";
import CategoryCard from "@/components/Category.vue";

import { socket } from "@/connection/index.ts";

@Component({
  components: {
    CategoryCard,
    Spinner
  }
})
export default class Home extends Vue {
  snackbar = false;
  snackbar_message_ = null;
  items_notification_ = [];

  loading = false;
  loadingBtn = false;

  id = "";
  inputRules = [v => !!v || "ID is required"];
  items_ = [
    {
      action: "15 min",
      headline: "Brunch this weekend?",
      title: "Ali Connors",
      subtitle:
        "I'll be in your neighborhood doing errands this weekend. Do you want to hang out?",
      checked: false
    },
    {
      action: "2 hr",
      headline: "Summer BBQ",
      title: "me, Scrott, Jennifer",
      subtitle: "Wish I could come, but I'm out of town this weekend.",
      checked: false
    },
    {
      action: "6 hr",
      headline: "Oui oui",
      title: "Sandra Adams",
      subtitle: "Do you have Paris recommendations? Have you ever been?",
      checked: false
    },
    {
      action: "12 hr",
      headline: "Birthday gift",
      title: "Trevor Hansen",
      subtitle:
        "Have any ideas about what we should get Heidi for her birthday?",
      checked: false
    },
    {
      action: "18hr",
      headline: "Recipe to try",
      title: "Britta Holt",
      subtitle: "We should eat this: Grate, Squash, Corn, and tomatillo Tacos.",
      checked: false
    }
  ];

  categories_ = [];

  get items() {
    return this.items_;
  }

  set items(val) {
    this.items_ = val;
  }

  get items_notification() {
    return this.items_notification_;
  }

  set items_notification(val) {
    this.items_notification_ = val;
  }

  get categories() {
    return this.categories_;
  }

  set categories(val) {
    this.categories_ = val;
  }

  get snackbar_message() {
    return this.snackbar_message_;
  }

  set snackbar_message(val) {
    this.snackbar_message_ = val;
  }

  not_initiator = 0;

  @Watch("items_notification")
  onNotification(val) {
    if (val.length > 0 && this.not_initiator === 1) {
      this.alert();
    } else if (val.length === 0) {
      this.stopAlert();
    }
  }

  @Watch("loading")
  onLoading(val) {
    if (!val) {
      // When loading is cancelled
      const target = document.getElementById("select");
      this.$vuetify.goTo(target, {
        duration: 300,
        offset: 0,
        easing: "easeInOutCubic"
      });
    }
  }

  interval;

  mounted() {
    /// Meaning base64 string should work right out of the box
    const picture =
      "data:image/jpeg;base64,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";

    const categories = [
      {
        category: "Presidents",
        candidates: [
          {
            name: "James Wilkins",
            picture, // base64 string - working
            party: "PartyA",
            checked: false
          },
          {
            name: "Lauren Yammel",
            picture: "https://picsum.photos/300/300?image=10",
            party: "PartyB",
            checked: false
          },
          {
            name: "Alayna Sacks",
            picture: "https://picsum.photos/300/300?image=20",
            party: "PartyC",
            checked: false
          }
        ]
      },
      {
        category: "Senators",
        candidates: [
          {
            name: "Norris Ireland",
            picture: "https://picsum.photos/300/300?image=30",
            party: "PartyA",
            checked: false
          },
          {
            name: "Dario Talbot",
            picture: "https://picsum.photos/300/300?image=40",
            party: "PartyB",
            checked: false
          },
          {
            name: "Olin Mcelwee",
            picture: "https://picsum.photos/300/300?image=50",
            party: "PartyC",
            checked: false
          },
          {
            name: "Rickie Kovacs",
            picture: "https://picsum.photos/300/300?image=60",
            party: "PartyC",
            checked: false
          },
          {
            name: "Rosaline Higgenbotham",
            picture: "https://picsum.photos/300/300?image=70",
            party: "PartyC",
            checked: false
          },
          {
            name: "Bobbye Tupper  ",
            picture: "https://picsum.photos/300/300?image=80",
            party: "PartyC",
            checked: false
          }
        ]
      },
      {
        category: "Governor",
        candidates: [
          {
            name: "Sina Bartram",
            picture: "https://picsum.photos/300/300?image=81",
            party: "PartyA",
            checked: false
          },
          {
            name: "Ileen Penley",
            picture: "https://picsum.photos/300/300?image=32",
            party: "PartyB",
            checked: false
          },
          {
            name: "Bonnie Kernan",
            picture: "https://picsum.photos/300/300?image=44",
            party: "PartyC",
            checked: false
          },
          {
            name: "Gerri Piedra",
            picture: "https://picsum.photos/300/300?image=12",
            party: "PartyD",
            checked: false
          }
        ]
      }
    ];

    const notifications = [
      {
        category: "Pastors",
        type: "add",
        candidates: [
          {
            name: "Alfredia Akey",
            picture: "https://picsum.photos/300/300?image=2",
            party: "PartyG"
          },
          {
            name: "Cythia Markert",
            picture: "https://picsum.photos/300/300?image=21",
            party: "PartyZ"
          }
        ]
      },
      { category: "Senators", type: "delete" },
      { category: "Governor", type: "update", newName: "Governors" },
      {
        category: "Governors", // after update
        type: "update",
        candidates: [
          {
            name: "Darryl Saia",
            picture: "https://picsum.photos/300/300?image=37",
            party: "PartyE"
          },
          {
            name: "Ula Rueter",
            picture: "https://picsum.photos/300/300?image=94",
            party: "PartyJ"
          }
        ]
      }
    ];

    // setTimeout(() => {
    //   notifications.forEach((notification, index, array) => {
    //     if (index === 0) {
    //       this.loading = true;
    //     }
    //     setTimeout(() => {
    //       this.notificationProcessor(notification);

    //       if (index === array.length - 1) {
    //         this.loading = false;
    //       }
    //     }, 3000 * (index + 1));
    //   });
    // }, 7700);

    // Get seed data from route params
    // this.categories = categories;
    this.categories = this.$route.params.data;

    if (!this.categories) {
      this.categories = [];
    }

    socket.on("update", data => {
      console.log("VOTER: Got new Updates from WS-SERVER", { data });

      if (data && data.data) {
        this.notificationProcessor(data.data);
      }
    });

    socket.on("seed-data", data => {
      console.log("VOTER: Got seed data from WS-SERVER -> after", { data });

      if (!data || !data.data || data.data.length === 0) {
        this.$router.push({ name: "splashscreen" });
      }
    });
  }

  alert() {
    // const card1 = document.getElementById("card1");
    const select = document.getElementById("select");
    this.interval = setInterval(() => {
      // card1.style.boxShadow = "0 0 30px #E1D041";
      select.style.boxShadow = "0 0 15px #E1D041";
      setTimeout(() => {
        // card1.style.boxShadow =
        //   "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)";
        select.style.boxShadow = "unset";
      }, 1000);
    }, 2000);
  }

  stopAlert() {
    clearInterval(this.interval);
  }

  openToast(message) {
    this.snackbar_message = message;
    this.snackbar = true;
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  check(item) {
    this.items.forEach((item_inner, index, array) => {
      item_inner.checked = false;
      if (index === array.length - 1) {
        item.checked = !item.checked;
      }
    });
  }

  openNotification(e) {
    this.items_notification = [];
  }

  notificationProcessor(data) {
    let message;
    switch (data.type) {
      case "add":
        // Adding checker property to each candidate
        data.candidates = data.candidates.map(candidate => {
          candidate.checked = false;
          return candidate;
        });

        this.categories.push({
          category: data.category,
          candidates: data.candidates
        });

        message = `${this.capitalize(data.category)} category added with ${
          data.candidates.length
        } candidates`;
        break;
      case "update":
        const index = this.categories.findIndex(
          item => item.category.toLowerCase() === data.category.toLowerCase()
        );

        if (data.newName) {
          this.categories[index].category = data.newName;

          message = `${this.capitalize(data.category)} category is now ${
            data.newName
          }`;
        } else {
          data.candidates = data.candidates.map(candidate => {
            candidate.checked = false;
            return candidate;
          });

          this.categories[index].candidates = data.candidates;

          message = `Candidate list updated for ${this.capitalize(
            data.category
          )} category`;
        }
        break;
      case "delete":
        this.categories = this.categories.filter(
          item => item.category.toLowerCase() !== data.category.toLowerCase()
        );

        message = `${this.capitalize(data.category)} category removed`;
        break;
    }

    this.items_notification.push(message);
    this.not_initiator++;
  }

  vote() {
    if (!this.id || this.id.trim() === "") {
      this.openToast("Please enter your ID before voting");
      return;
    }

    const voteObject = {};
    voteObject.id = this.id;
    for (const category of this.categories) {
      for (const candidate of category.candidates) {
        if (candidate.checked === true) {
          voteObject[category.category] = candidate.name;
        }
      }
    }

    if (Object.keys(voteObject).length === 1) {
      // Meaning only id, and didn't vote for anybody
      this.openToast("Please choose at least one candidate");
      return;
    }

    console.log("VOTER: Voter data about to be submitted to MANAGER", {
      data: voteObject
    });

    this.loadingBtn = true;

    axios
      .default({
        method: "post",
        url: "/manager/voter-in",
        data: voteObject
      })
      .then(() => {
        this.loadingBtn = false;
        this.$refs.id_input.reset();
        this.openToast("Thanks, Patriot!!!");
      })
      .catch(e => {
        this.loadingBtn = false;
        console.log(e);
        this.openToast(e.response ? e.response.data : e);
      });
  }
}
</script>

<style lang="scss">
.home {
  height: 100%;
  width: 100%;
  // background-color: red;
}

.notification-bar,
.body-area,
.submit-area {
  width: 100%;
}

.notification-bar {
  min-height: 77px;
  // background-color: yellowgreen;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

@media (max-width: 600px) {
  .notification-bar {
    justify-content: center;
  }
}

.notification {
  width: 320px;
  height: 50px;
}

.body-area {
  // background-color: gray;
  box-sizing: border-box;
  padding: 30px;
  text-align: center;
  margin-bottom: 164px;
}

.category {
  display: inline-block;
  vertical-align: top;
  transition: all 0.4s ease-in-out;
}

.v-list__tile {
  cursor: pointer;
}

.v-list__tile__action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  width: 400px;
  // background: yellow;
}

.input,
.button {
  display: inline-block;
}

.input {
  width: calc(100% - 100px);
  box-sizing: border-box;
  padding: 5px 20px;
}

.button {
  width: 100px;
}

.full-width {
  width: 100%;
}

.big-text {
  font-size: 20px;
}
</style>
