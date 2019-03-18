<template>
  <v-card class="pa-3">
    <v-card-text>
      <v-text-field v-model="name" label="Category name"></v-text-field>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn color="primary" flat="flat" @click="submit">{{data? 'UPDATE' : 'ADD'}}</v-btn>
      <v-btn color="error" flat="flat" @click="dismiss">CANCEL</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["data", "allCategories"]
})
export default class CategoryNameComponent extends Vue {
  name = null;

  created() {
    if (this.data) {
      this.name = this.data.parent.name;
    }
  }

  submit() {
    if (
      !this.name ||
      this.name.trim() === "" ||
      (this.data &&
        this.name.toLowerCase() === this.data.parent.name.toLowerCase())
    ) {
      this.$emit("notify", "Nothing new to update");
      return;
    }

    const found = this.allCategories.findIndex(item => {
      return item.name.toLowerCase() === this.name.toLowerCase();
    });

    if (found !== -1) {
      this.$emit("notify", "Category with the name already exists");
      return;
    }

    this.$emit("dismiss", {
      data: this.data,
      name: this.name
    });
  }

  dismiss() {
    this.$emit("dismiss");
  }
}
</script>