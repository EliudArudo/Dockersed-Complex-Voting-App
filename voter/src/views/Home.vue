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
            <v-btn class="pa-0" flat large color="primary" @click="vote">VOTE</v-btn>
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
//// Today - get pictures working with base64 strings

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

import Spinner from "vue-spinner/src/BeatLoader.vue";
import CategoryCard from "@/components/Category.vue";

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
    const categories = [
      {
        category: "Presidents",
        candidates: [
          {
            name: "James Wilkins",
            picture: "https://picsum.photos/300/300?image=0",
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

    this.categories = categories;

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

    setTimeout(() => {
      notifications.forEach((notification, index, array) => {
        if (index === 0) {
          this.loading = true;
        }
        setTimeout(() => {
          this.notificationProcessor(notification);

          if (index === array.length - 1) {
            this.loading = false;
          }
        }, 3000 * (index + 1));
      });
    }, 7700);
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

    console.log(voteObject);
    this.$refs.id_input.reset();
    this.openToast("Thanks, Patriot!!!");
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
