<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import draggable from "vuedraggable"

  import AudioList from "@/components/audio/AudioList.vue"
  import { useSlices } from "@/stores/slices"

  import SlicesListItem from "./SlicesListItem.vue"

  const props = withDefaults(
    defineProps<{
      canDuplicate: boolean
    }>(),
    {
      canDuplicate: true,
    },
  )

  const slicesStore = useSlices()
  const { slicesList, totalSlices } = storeToRefs(slicesStore)
</script>

<template>
  <AudioList>
    <template #title>Slices</template>
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
            :can-duplicate="props.canDuplicate"
          />
        </li>
      </template>
    </draggable>
  </AudioList>
</template>

<style scoped>
  li :deep(legend) {
    cursor: move;
  }

  .ghost {
    opacity: 0.5;
  }
</style>
