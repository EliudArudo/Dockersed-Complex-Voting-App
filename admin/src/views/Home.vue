<template>
  <v-content>
    <v-container class="home pl-0 pr-0 mr-5 ml-5">
      <div class="notification-bar">
        <span class="title primary--text">ADMIN'S LOUNGE</span>
      </div>
      <div class="body">
        <v-card width="290">
          <v-card-title class="pb-0">
            <span>Category</span>
            <v-spacer></v-spacer>
            <span class="light-grey">1.2 million votes</span>
          </v-card-title>

          <v-list three-line>
            <template v-for="(item, index) in items">
              <v-list-tile :key="item.title" avatar ripple @click="toggle(index)">
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">James Wilkens</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="text--primary">PartyA</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="green-text">23%</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon class="item-icons" color="error">highlight_off</v-icon>
                  <v-icon class="item-icons" color="grey">settings</v-icon>
                  <v-list-tile-action-text>400,000 votes</v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider v-if="index + 1 < items.length" :key="index"></v-divider>
            </template>

            <v-list-tile class="add-button">
              <v-list-tile-action>
                <!-- <v-list-tile-title>ADD CANDIDATE</v-list-tile-title> -->
                <v-btn flat large color="primary">ADD CANDIDATE</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-btn flat icon color="error">
              <v-icon>highlight_off</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card width="290">
          <v-card-title class="pb-0">
            <span>Category</span>
            <v-spacer></v-spacer>
            <span class="light-grey">1.2 million votes</span>
          </v-card-title>

          <v-list three-line>
            <template v-for="(item, index) in items">
              <v-list-tile :key="item.title" avatar ripple @click="toggle(index)">
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">James Wilkens</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="text--primary">PartyA</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="green-text">23%</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon class="item-icons" color="error">highlight_off</v-icon>
                  <v-icon class="item-icons" color="grey">settings</v-icon>
                  <v-list-tile-action-text>400,000 votes</v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider v-if="index + 1 < items.length" :key="index"></v-divider>
            </template>

            <v-list-tile class="add-button">
              <v-list-tile-action>
                <!-- <v-list-tile-title>ADD CANDIDATE</v-list-tile-title> -->
                <v-btn flat large color="primary">ADD CANDIDATE</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-btn flat icon color="error">
              <v-icon>highlight_off</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card width="290">
          <v-card-title class="pb-0">
            <span>Category</span>
            <v-spacer></v-spacer>
            <span class="light-grey">1.2 million votes</span>
          </v-card-title>

          <v-list three-line>
            <template v-for="(item, index) in items">
              <v-list-tile :key="item.title" avatar ripple @click="toggle(index)">
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">James Wilkens</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="text--primary">PartyA</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="green-text">23%</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon class="item-icons" color="error">highlight_off</v-icon>
                  <v-icon class="item-icons" color="grey">settings</v-icon>
                  <v-list-tile-action-text>400,000 votes</v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider v-if="index + 1 < items.length" :key="index"></v-divider>
            </template>

            <v-list-tile class="add-button">
              <v-list-tile-action>
                <!-- <v-list-tile-title>ADD CANDIDATE</v-list-tile-title> -->
                <v-btn flat large color="primary">ADD CANDIDATE</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-btn flat icon color="error">
              <v-icon>highlight_off</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card width="290">
          <v-card-title class="pb-0">
            <span>Category</span>
            <v-spacer></v-spacer>
            <span class="light-grey">1.2 million votes</span>
          </v-card-title>

          <v-list three-line>
            <template v-for="(item, index) in items">
              <v-list-tile :key="item.title" avatar ripple @click="toggle(index)">
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">James Wilkens</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="text--primary">PartyA</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="green-text">23%</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon class="item-icons" color="error">highlight_off</v-icon>
                  <v-icon class="item-icons" color="grey">settings</v-icon>
                  <v-list-tile-action-text>400,000 votes</v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="index"></v-divider>
            </template>

            <v-list-tile class="add-button">
              <v-list-tile-action>
                <!-- <v-list-tile-title>ADD CANDIDATE</v-list-tile-title> -->
                <v-btn flat large color="primary">ADD CANDIDATE</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-btn flat icon color="error">
              <v-icon>highlight_off</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card width="290">
          <v-card-title class="pb-0">
            <span>Category</span>
            <v-spacer></v-spacer>
            <span class="light-grey">1.2 million votes</span>
          </v-card-title>

          <v-list three-line>
            <template v-for="(item, index) in items">
              <v-list-tile :key="item.title" avatar ripple @click="toggle(index)">
                <v-list-tile-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg">
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">James Wilkens</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="text--primary">PartyA</v-list-tile-sub-title>
                  <v-list-tile-sub-title class="green-text">23%</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon class="item-icons" color="error">highlight_off</v-icon>
                  <v-icon class="item-icons" color="grey">settings</v-icon>
                  <v-list-tile-action-text>400,000 votes</v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="index"></v-divider>
            </template>

            <v-list-tile class="add-button">
              <v-list-tile-action>
                <!-- <v-list-tile-title>ADD CANDIDATE</v-list-tile-title> -->
                <v-btn flat large color="primary">ADD CANDIDATE</v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>

          <v-card-actions>
            <v-btn flat icon color="error">
              <v-icon>highlight_off</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card width="290" height="290" class="add-card">
          <v-card-text>
            <v-btn flat icon color="primary" large>
              <v-icon>add</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <v-btn flat large color="primary">SUBMIT CHANGES</v-btn>
          <v-btn flat large color="error">SHUTDOWN VOTING PROCESS</v-btn>
        </div>
      </v-footer>
    </v-container>
  </v-content>
</template>

<script>
/// Realistic data simultation
/// Refactor Cards into compontents
/// Add Login-Screen
/// Add prompt dialog ("Are you sure?")
/// Add message snackbars
/// Add Addition/Update input dialog
/// Data submission in voter-notification format
/// Add down button to scroll to add-card (Make it easy to scroll to add category card)

import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Component({
  components: {
    HelloWorld
  }
})
export default class Home extends Vue {
  items = [
    {
      action: "15 min",
      headline: "Brunch this weekend?",
      title: "Ali Connors",
      subtitle:
        "I'll be in your neighborhood doing errands this weekend. Do you want to hang out?"
    },
    {
      action: "2 hr",
      headline: "Summer BBQ",
      title: "me, Scrott, Jennifer",
      subtitle: "Wish I could come, but I'm out of town this weekend."
    },
    {
      action: "6 hr",
      headline: "Oui oui",
      title: "Sandra Adams",
      subtitle: "Do you have Paris recommendations? Have you ever been?"
    },
    {
      action: "12 hr",
      headline: "Birthday gift",
      title: "Trevor Hansen",
      subtitle:
        "Have any ideas about what we should get Heidi for her birthday?"
    },
    {
      action: "18hr",
      headline: "Recipe to try",
      title: "Britta Holt",
      subtitle: "We should eat this: Grate, Squash, Corn, and tomatillo Tacos."
    }
  ];

  selected = [2];

  toggle(index) {
    const i = this.selected.indexOf(index);

    if (i > -1) {
      this.selected.splice(i, 1);
    } else {
      this.selected.push(index);
    }
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

.v-card {
  display: inline-block;
  margin: 10px;
  vertical-align: top;
}

.add-card {
  transition: all 0.2s ease;
}

.add-card .v-card__text {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-card .v-btn {
  height: 60%;
  width: 60%;
}

.add-card .v-icon {
  font-size: 100px !important;
}

.add-card:active {
  transform: scale(0.8);
}

.v-card__actions {
  justify-content: flex-end;
}

.add-button {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
