<template>
  <div class="splashscreen">
    <div class="welcome">
      <div class="welcome-body">
        <div class="progress-div">
          <v-progress-linear
            color="primary"
            height="2"
            :value="progress"
            :indeterminate="indeterminate"
          ></v-progress-linear>
        </div>
        <div class="welcome-text">
          <div class="login-inputs pl-4 pr-4">
            <div>
              <v-text-field v-model="login.email" label="Email"></v-text-field>
            </div>
            <div>
              <v-text-field v-model="login.password" label="Password" type="password"></v-text-field>
            </div>
          </div>
        </div>
        <div class="actions text-xs-center">
          <v-btn @click="submit" flat small color="primary">Login</v-btn>
        </div>
      </div>
    </div>

    <v-dialog v-model="loading" width="300" persistent>
      <Loading :message="loadingMessage"/>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="timeout">
      {{ snackMessage }}
      <v-btn color="pink" flat @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import { Vue, Component, Watch } from "vue-property-decorator";
import Loading from "@/components/Loading.vue";

import * as axios from "axios";
import { socket } from "@/connection/index.ts";

@Component({
  components: {
    Loading
  }
})
export default class LoginPage extends Vue {
  loading = false;
  snackbar = false;
  timeout = 3000;

  votingProcess = true;

  progress = 0;

  indeterminate = true;

  login = {
    email: null,
    password: null
  };

  emailMin = 13;
  passwordMin = 6;

  seed_data = null;

  loadingMessage = null;
  snackMessage_ = false;

  shutdown = null;

  get snackMessage() {
    return this.snackMessage_;
  }

  set snackMessage(val) {
    this.snackMessage_ = val;
  }

  @Watch("login", { deep: true })
  onInputChanged(val) {
    const totalLength =
      (val.email ? val.email : "").length +
      (val.password ? val.password : "").length;

    this.indeterminate = totalLength === 0;

    this.progress =
      ((val.email ? val.email : "").length / this.emailMin) * 100 * 0.5 +
      ((val.password ? val.password : "").length / this.passwordMin) *
        100 *
        0.5;
  }

  mounted() {
    socket.on("connect", () => {
      console.log("ADMIN: Successfully connected to WS-SERVER");
    });

    socket.on("seed-data", data => {

      if (data) {
        this.seed_data = data.data;
        this.shutdown = data.shutdown;
      }
    });
  }

  startLoading(message) {
    this.loadingMessage = message;
    this.loading = true;
  }

  stopLoading() {
    this.loading = false;
  }

  openToast(message, duration = 3000) {
    this.timeout = duration;
    this.snackMessage = message;
    this.snackbar = true;
  }

  submit() {
    const email = this.login.email;
    const password = this.login.password;

    const empty =
      !email || !password || email.trim() === "" || password.trim() === "";

    if (empty) {
      this.openToast("Please fill all the inputs correctly");
      return;
    }

    if (email.length < 11) {
      this.openToast("Email is too short");
      return;
    }

    if (password.length < 6) {
      this.openToast("Passwords should be 6 characters or more");
      return;
    }

    this.startLoading("Logging you in");

    axios
      .default({
        method: "post",
        url: "/manager/admin-login",
        data: {
          email,
          password
        }
      })
      .then(res => {
        //// Requests to the server done here
        this.stopLoading();

        // Push whether there's data or not, because it's admin who creates seed data;
        this.$router.push({
          name: "home",
          params: {
            data: this.seed_data,
            token: res.data.token,
            shutdown: this.shutdown
          }
        });

        //// Requests to the server done here
      })
      .catch(e => {
        const message = e.response ? e.response.data : e;

        this.stopLoading();
        this.openToast(message);
      });
  }
}
</script>

<style lang="scss">
.splashscreen {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome {
  // background: red;
  height: 230px;
  width: 300px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.v-progress-linear {
  margin-top: 0 !important;
}

.welcome-body {
  height: 100%;
}

.welcome-text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(43, 29, 29);
  height: 60%;
}

.login-inputs {
  width: 100%;
}

.welcome-body,
.welcome-text,
.welcome-spinner {
  width: 100%;
}

.welcome-text div {
  text-align: center;
}

.welcome-spinner {
  text-align: center;
}

.bigger-text {
  font-size: 33px;
  font-weight: 400;
}

.progress-div {
  width: 100%;
}

input {
  color: #1976d2 !important;
}
</style>

