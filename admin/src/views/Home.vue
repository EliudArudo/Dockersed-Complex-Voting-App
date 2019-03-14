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
import Category from "@/components/Category.vue";
import AddCategory from "@/components/AddCategory.vue";
import Prompt from "@/components/Prompt.vue";

@Component({
  components: {
    HelloWorld,
    Category,
    AddCategory,
    Prompt
  }
})
export default class Home extends Vue {
  selected = [2];

  dialog = false;

  confirmData_ = null;

  get confirmData() {
    return this.confirmData_;
  }

  set confirmData(val) {
    this.confirmData_ = val;
  }

  categories = [
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 900000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    },
    {
      name: "Category",
      currentVotes: 1200000, // Get a humanizer function
      candidates: [
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        },
        {
          name: "James Wilkens",
          picture: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          party: "PartyA",
          currentVotes: 400000
        }
      ]
    }
  ];

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
    console.log(data);
  }

  openPrompt(data) {
    this.confirmData = data;
    this.dialog = true;
  }

  confirm(data) {
    console.log(data);
    this.dialog = false;
  }

  dismiss() {
    this.dialog = false;
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
</style>
