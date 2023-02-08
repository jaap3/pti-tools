<script setup lang="ts">
  import ShowMessages from "@/components/messages/ShowMessages.vue"

  import FooterBar from "./FooterBar.vue"

  defineEmits<{
    (e: "click"): void
  }>()

  withDefaults(defineProps<{ tag: string; showAppreciation: boolean }>(), {
    tag: "main",
    showAppreciation: false,
  })
</script>

<template>
  <component :is="tag" class="main" @click="$emit('click')">
    <slot />
    <ShowMessages />
  </component>
  <FooterBar :show-appreciation="showAppreciation" />
</template>

<style scoped>
  .main {
    position: sticky;
    top: 0;
    width: 100%;
    max-width: 954px;
    height: calc(100vh - 24px);
    margin: 0 auto;
  }

  @media only screen and (min-width: 748px) {
    footer {
      position: sticky;
    }

    footer :deep(> div) {
      flex-direction: row;
    }

    footer :deep(> div > *:not(:first-child)) {
      margin-left: 8px;
    }
  }
</style>
