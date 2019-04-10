<template>
  <v-card>
    <!-- <v-card-title class="justify-center">Review</v-card-title> -->
    <v-card-text>
      <v-list>
        <v-list-group
          v-for="(item, index) in items"
          :key="item.title + index"
          v-model="item.active"
          no-action
        >
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>

          <v-list-tile
            v-for="(subItem, i) in item.items"
            :key="subItem.title + i"
            class="remove-padding-left"
            @click="getItem(subItem, item)"
            ripple
          >
            <v-list-tile-action>
              <v-icon
                :class="subItem.action === 'history'? 'clickable' : ''"
                :color="subItem.action === 'history'? 'primary' : ''"
              >{{ subItem.action }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-sub-title>{{ subItem.title }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="primary" flat="flat" @click="dismiss(true)">GREAT!</v-btn>

      <v-btn color="error" flat="flat" @click="dismiss()">NOP</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["changes", "categories"]
})
export default class SubmitChangeDialogComponent extends Vue {
  data = null;

  items = [];

  created() {
    // this.data = [...this.changes];
    this.transformChanges();
  }

  getItem(list_item, group) {
    if (list_item.title === "RESTORE") {
      const category = group.title;
      // Remove this from our items,
      // Send name to homepage
      // Restore from original list
      // Remove traces of title from notifications, totalChanges and more

      this.items = this.items.filter(item => item.title !== category);
      this.$emit("restore", category);

      if (this.items.length === 0) {
        this.$emit("dismiss");
      }
    }
  }

  transformChanges() {
    let items = [];

    let commonCategories = [];
    for (const item of this.changes) {
      const foundIndex = items.findIndex(it => it.title === item.category);

      const action =
        item.message.toLowerCase().includes("updated") ||
        item.message.toLowerCase().includes("now")
          ? "rotate_right"
          : "delete";

      if (foundIndex === -1) {
        items.push({
          title: item.category,
          items: [
            {
              title: item.message,
              action
            },
            {
              title: "RESTORE",
              action: "history"
            }
          ]
        });
      } else {
        items[foundIndex].items.unshift({
          title: item.message,
          action
        });
      }
    }

    this.items = items;
  }

  dismiss(e) {
    this.$emit("dismiss", e);
  }
}
</script>  

<style lang="scss">
.remove-padding-left .v-list__tile {
  padding-left: 15px !important;
}

.remove-padding-left .v-list__tile__action {
  min-width: 30px;
}

.remove-padding-left .v-list__tile__sub-title {
  white-space: unset !important;
}
</style>