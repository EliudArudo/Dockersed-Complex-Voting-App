<template>
  <v-card width="290" height="290" class="category-card add-card">
    <v-card-text>
      <v-btn flat icon color="primary" large @click="click('category', 'add', null, null)">
        <v-icon>add</v-icon>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class AddCategoryComponent extends Vue {
  click(type, action, item, parent) {
    const data = {
      type, // canditate // category // add-candidate
      action, // delete // update
      item, // real item to modify
      parent
    };

    this.$emit("clicked", data);
  }
}
</script>

<style lang="scss">
.add-button {
  display: flex;
  justify-content: center;
  align-items: center;
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
</style>
