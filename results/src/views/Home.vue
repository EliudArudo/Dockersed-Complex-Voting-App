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

import { categories, parties } from "@/mock/index.ts";

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

  @Watch("loading")
  onLoadingChanged(val) {
    if (val) {
      this.cheatcode++;
    }
  }

  mounted() {
    this.categories = JSON.parse(JSON.stringify(categories));
    this.parties = JSON.parse(JSON.stringify(parties));
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

