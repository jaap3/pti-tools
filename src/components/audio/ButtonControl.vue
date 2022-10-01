<script setup lang="ts">
  defineProps<{ icon?: string }>()
</script>

<template>
  <button type="button">
    <span v-if="icon" class="material-icons">{{ icon }}</span>
  </button>
</template>

<style scoped>
  :where(button) {
    margin: 0 4px;
    line-height: 1;
    user-select: none;
  }

  :where(button:first-child) {
    margin-left: 0;
  }

  :where(button:last-child) {
    margin-right: 0;
  }
</style>
