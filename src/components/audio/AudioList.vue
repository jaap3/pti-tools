<script setup lang="ts">
  import StyledFieldset from "@/components/base/StyledFieldset.vue"
</script>

<template>
  <StyledFieldset>
    <template #legend><slot name="title" /></template>
    <slot />
  </StyledFieldset>
</template>

<style scoped>
  fieldset {
    flex-grow: 1;
    padding-bottom: 8px;
  }

  :deep(ol) {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 100%;
    max-width: 300px;
    padding: 0;
    margin: 0 auto;
    list-style: none;
  }

  :deep(li) {
    margin: 8px 0;
  }

  @media only screen and (min-width: 655px) {
    :deep(ol) {
      max-width: 608px;
    }
  }

  @media only screen and (min-width: 976px) {
    :deep(li fieldset) {
      margin: 0 -1px;
    }

    :deep(ol) {
      max-width: 960px;
    }

    :deep(li:nth-child(3n + 2)) {
      margin: 8px 16px;
    }
  }
</style>
