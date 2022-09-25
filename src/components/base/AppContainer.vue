<script setup lang="ts">
  import ShowMessages from "@/components/messages/ShowMessages.vue"

  import FooterBar from "./FooterBar.vue"

  withDefaults(defineProps<{ tag: string; showAppreciation: boolean }>(), {
    tag: "main",
    showAppreciation: false,
  })
</script>

<template>
  <div class="wrapper">
    <component :is="tag" class="main">
      <ShowMessages />
      <slot />
    </component>
    <FooterBar :show-appreciation="showAppreciation" />
  </div>
</template>

<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    max-width: 954px;
    height: 100%;
    padding: 0 1px;
    margin: 0 auto;
  }
</style>
