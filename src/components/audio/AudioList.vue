<script setup lang="ts">
  import StyledFieldset from "@/components/base/StyledFieldset.vue"
</script>

<template>
  <StyledFieldset tabindex="0">
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
    overflow-y: scroll;
    scrollbar-width: thin;
    scrollbar-color: var(--almost-white) var(--near-black);
  }

  fieldset::-webkit-scrollbar {
    width: 8px;
  }

  fieldset::-webkit-scrollbar-track {
    background: var(--near-black);
  }

  fieldset::-webkit-scrollbar-thumb {
    background-color: var(--almost-white);
    border: 1px solid var(--near-black);
  }

  .list > :deep(ol) {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 16px 8px;
    justify-content: center;
    padding: 0 8px;
    margin: 0;
    list-style: none;
  }
</style>
