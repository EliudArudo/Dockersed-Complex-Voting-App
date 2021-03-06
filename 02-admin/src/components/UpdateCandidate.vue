<template>
  <v-card>
    <v-card-text>
      <div class="candidate">
        <div class="candidate-image">
          <v-avatar
            class="candidate-avatar"
            :size="70"
            color="primary lighten-2"
            @click="uploadPic('candidate-picture')"
          >
            <img :src="candidate_pic || require('@/assets/avatar.png')" alt="avatar">
          </v-avatar>

          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            id="candidate-picture"
            style="display:none;"
          >
        </div>
        <div class="candidate-info">
          <div class="full-width">
            <v-text-field v-model="candidate_name" label="Name"></v-text-field>
          </div>
          <div class="full-width">
            <v-text-field v-model="candidate_party" label="Party"></v-text-field>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn
        color="primary"
        flat="flat"
        @click="submit"
      >{{this.candidateInfo && this.candidateInfo.item? 'UPDATE' : 'ADD'}}</v-btn>

      <v-btn color="error" flat="flat" @click="dismiss">CANCEL</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({
  props: ["candidateInfo", "categories"]
})
export default class UpdateCandidateComponent extends Vue {
  candidate_name = null;
  candidate_party = null;
  candidate_pic_ = null;

  created() {
    if (this.candidateInfo && this.candidateInfo.item) {
      this.candidate_name = { ...this.candidateInfo }.item.name || null;
      this.candidate_party = { ...this.candidateInfo }.item.party || null;
      this.candidate_pic = { ...this.candidateInfo }.item.picture || null;
    }
  }

  get candidate_pic() {
    return this.candidate_pic_;
  }

  set candidate_pic(val) {
    this.candidate_pic_ = val;
  }

  resizeImage(settings) {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement("canvas");
    const dataURItoBlob = function(dataURI) {
      const bytes =
        dataURI.split(",")[0].indexOf("base64") >= 0
          ? atob(dataURI.split(",")[1])
          : unescape(dataURI.split(",")[1]);
      const mime = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const max = bytes.length;
      const ia = new Uint8Array(max);
      for (let i = 0; i < max; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ia], { type: mime });
    };
    const resize = function() {
      let width = image.width;
      let height = image.height;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      return dataURItoBlob(dataUrl);
    };
    return new Promise(function(ok, no) {
      if (!file.type.match(/image.*/)) {
        no(new Error("Not an image"));
        return;
      }
      reader.onload = function(readerEvent) {
        image.onload = function() {
          return ok(resize());
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  getPictureHTML(file_input_element, limit) {
    file_input_element.click();

    const This = this;

    return new Promise((resolve, reject) => {
      file_input_element.addEventListener("change", function() {
        const image = this.files[0];

        if (image) {
          const ImageRef = new Image();
          ImageRef.src = window.URL.createObjectURL(image);

          // CHECK IMAGE SIZE FIRST before resizing it
          let imagesize; /// ----- Get this from Image

          ImageRef.onload = function() {
            imagesize = {
              width: ImageRef.naturalWidth,
              height: ImageRef.naturalHeight
            };

            if ((imagesize.width < 500 || imagesize.height < 500) && limit) {
              reject("Image size must be 1024 x 700 or greater");
              return;
            }

            // If the image is more or that size itself
            This.resizeImage({
              file: image,
              maxSize: 500
            })
              .then(resizedImage => {
                const file = new File([resizedImage], image.name);
                resolve(file);
              })
              .catch(e => {
                reject(e);
              });
          };
        } else {
          /// If there's no image
          file_input_element.value = "";
        }
      });
    });
  }

  async uploadPic(id) {
    try {
      const element = document.getElementById(id);
      const pic = await this.getPictureHTML(element);

      const reader = new FileReader();
      reader.readAsDataURL(pic);
      reader.onloadend = () => {
        const base64data = reader.result;
        this.candidate_pic = base64data;
      };
    } catch (e) {
      console.log(e);
    }
  }

  submit() {
    const nullStatus =
      !this.candidate_name ||
      !this.candidate_party ||
      !this.candidate_pic ||
      (this.candidate_name.trim() === "" || this.candidate_party.trim() === "");

    if (nullStatus) {
      this.$emit("notify", "Please update all fields as required");
      return;
    }

    /// Make sure no two parties are in the same category
    // All canidateInfos should have a parent --- ALL
    const partyExists = this.candidateInfo.parent.candidates.findIndex(
      person =>
        person.party.toLowerCase().trim() ===
        this.candidate_party.toLowerCase().trim()
    );

    // All canidateInfos should have a parent --- ALL
    const nameExists = this.candidateInfo.parent.candidates.findIndex(
      person =>
        person.name.toLowerCase().trim() ===
        this.candidate_name.toLowerCase().trim()
    );

    // Manual check here
    if (partyExists !== -1 && !this.candidateInfo.item) {
      this.$emit(
        "notify",
        "Two candidates cannot share the same party one category"
      );
      return;
    }

    if (nameExists !== -1 && !this.candidateInfo.item) {
      this.$emit("notify", "A candidate with the same name already exists");
      return;
    }

    // Check 2 -> Whether name exists in category, or anywhere
    // this.candidate_name
    // this.categories

    let data = { ...this.candidateInfo };

    if (this.candidateInfo && this.candidateInfo.item) {
      data.oldItem = { ...data.item };
    }

    const currentVotes =
      data && data.item && data.item.currentVotes ? data.item.currentVotes : 0;

    data.item = {
      currentVotes,
      name: this.candidate_name,
      originalName: this.candidate_name,
      party: this.candidate_party,
      picture: this.candidate_pic
    };

    this.$emit("dismiss", data);
  }

  dismiss() {
    this.$emit("dismiss");
  }
}
</script>

<style lang="scss">
</style>
