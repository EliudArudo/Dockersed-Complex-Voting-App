<template>
  <div>{{test}}</div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class HelloWorld extends Vue {
  test = "Hello world";
}
</script>

<style>
</style>
