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
    width: 40px;
    height: 40px;
    line-height: 1;
    user-select: none;
  }
</style>
