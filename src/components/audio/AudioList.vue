<script setup lang="ts">
  import StyledFieldset from "@/components/base/StyledFieldset.vue"
</script>

<template>
  <StyledFieldset>
    <template #legend><slot name="title" /></template>
    <div class="list">
      <slot />
    </div>
  </StyledFieldset>
</template>

<style scoped>
  fieldset {
    flex-grow: 1;
    padding-bottom: 24px;
  }

  .list > :deep(ol) {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 16px;
    justify-content: center;
    padding: 0 8px;
    margin: 0;
    list-style: none;
  }
</style>
