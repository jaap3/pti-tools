<script setup lang="ts">
  defineProps<{ icon?: string }>()
</script>

<template>
  <button type="button">
    <span v-if="icon" class="material-icons">{{ icon }}</span>
  </button>
</template>

<style scoped>
  :is(button) {
    margin: 0 4px;
    line-height: 1;
    user-select: none;
  }

  :is(button:first-child) {
    margin-left: 0;
  }

  :is(button:last-child) {
    margin-right: 0;
  }
</style>
