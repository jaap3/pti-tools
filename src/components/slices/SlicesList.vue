<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import draggable from "vuedraggable"

  import { useSlices } from "@/stores/slices"

  import SlicesListItem from "./SlicesListItem.vue"

  const slicesStore = useSlices()
  const { slicesList, totalSlices } = storeToRefs(slicesStore)
</script>

<template>
  <draggable
    v-model="slicesList"
    tag="ol"
    item-key="id"
    handle="legend"
    :swap-threshold="0.5"
    :animation="300"
    ghost-class="ghost"
  >
    <template #item="{ element, index }">
      <li>
        <SlicesListItem
          :slice="element"
          :can-move-up="index > 0"
          :can-move-down="index < totalSlices - 1"
        />
      </li>
    </template>
  </draggable>
</template>

<style scoped>
  ol {
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

  li {
    margin: 8px 0;
  }

  li :deep(legend) {
    cursor: move;
  }

  .ghost {
    opacity: 0.5;
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
      margin: 8px;
    }
  }
</style>
