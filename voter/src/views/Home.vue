<template>
  <v-content>
    <v-container class="home">
      <div class="notification-bar">
        <div class="notification" id="select">
          <v-select :items="items_notification" label="Solo field" solo @input="notification"></v-select>
        </div>
      </div>
      <div class="body-area">
        <CategoryCard
          :category="items"
          v-for="(category, i) in 3"
          :cardID="'card'+(i+1)"
          :key="'card' + i"
        />
      </div>

      <v-footer class="submit-area" fixed>
        <div class="submit-items">
          <div class="input">
            <v-text-field v-model="id" :rules="inputRules" label="Your id number" required></v-text-field>
          </div>
          <div class="button">
            <v-btn class="pa-0" flat large color="primary">VOTE</v-btn>
          </div>
        </div>
      </v-footer>
    </v-container>
  </v-content>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";

import CategoryCard from "@/components/Category.vue";

@Component({
  components: {
    CategoryCard
  }
})
export default class Home extends Vue {
  items_notification = ["Foo", "Bar", "Fizz", "Buzz"];

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

  get items() {
    return this.items_;
  }

  set items(val) {
    this.items_ = val;
  }

  interval;

  mounted() {
    const card1 = document.getElementById("card1");
    const select = document.getElementById("select");

    this.interval = setInterval(() => {
      card1.style.boxShadow = "0 0 30px #E1D041";
      select.style.boxShadow = "0 0 15px #E1D041";
      setTimeout(() => {
        card1.style.boxShadow =
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)";
        select.style.boxShadow = "unset";
      }, 1000);
    }, 2000);
  }

  check(item) {
    this.items.forEach((item_inner, index, array) => {
      item_inner.checked = false;
      if (index === array.length - 1) {
        item.checked = !item.checked;
      }
    });
  }

  notification(e) {
    console.log("Notification clicked", e);

    clearInterval(this.interval);
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
</style>
