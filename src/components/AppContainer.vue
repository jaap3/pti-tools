<script setup lang="ts">
  import ShowMessages from "@/components/messages/ShowMessages.vue"
  import FooterBar from "@/components/FooterBar.vue"

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
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 960px;
    height: 100%;
    margin: 0 auto;
    padding: 0 16px;
  }
</style>
