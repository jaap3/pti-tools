<script setup lang="ts">
  import { defineAsyncComponent } from "vue"
  import { storeToRefs } from "pinia"
  import draggable from "vuedraggable"
  import SlicesListItem from "@/components/audiofiles/SlicesListItem.vue"
  import { useSlices } from "@/stores/slices"

  const LayerEditor = defineAsyncComponent(
    () => import("@/components/audiofiles/LayerEditor.vue"),
  )

  const slicesStore = useSlices()
  const { slices, totalSlices, editSlice } = storeToRefs(slicesStore)
</script>

<template>
  <draggable
    :list="slices"
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
  <LayerEditor v-if="editSlice !== null" :slice="editSlice" />
</template>

<style scoped>
  ol {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 300px;
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
      margin: 8px 8px;
    }
  }
</style>
