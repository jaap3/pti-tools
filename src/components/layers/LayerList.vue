<script setup lang="ts">
  import { storeToRefs } from "pinia"

  import { useSlices } from "@/stores/slices"

  import LayerListItem from "./LayerListItem.vue"

  const slicesStore = useSlices()
  const { activeSliceLayers: layers } = storeToRefs(slicesStore)
</script>

<template>
  <ol>
    <li v-for="layer in layers" :key="layer.id">
      <LayerListItem :layer="layer" :can-delete="layers.length > 1" />
    </li>
  </ol>
</template>

<style scoped>
  .layers,
  ol {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
  }

  ol {
    flex-flow: row wrap;
    align-content: flex-start;
    width: 100%;
    max-width: 300px;
    padding: 0;
    margin: 0 auto;
    list-style: none;
  }

  li {
    margin: 8px 0;
  }

  li fieldset {
    margin: 0 -1px;
  }

  @media only screen and (min-width: 655px) {
    ol {
      max-width: 608px;
    }
  }

  @media only screen and (min-width: 976px) {
    ol {
      max-width: 960px;
    }

    li:nth-child(3n + 2) {
      margin: 8px 16px;
    }
  }
</style>
