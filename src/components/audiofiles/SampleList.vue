<script setup lang="ts">
  import draggable from "vuedraggable"
  import SampleListItem from "@/components/audiofiles/SampleListItem.vue"
  import { useAudioFiles } from "@/stores/audiofiles"

  const audioFilesStore = useAudioFiles()
</script>

<template>
  <draggable
    :list="audioFilesStore.audioFiles"
    tag="ol"
    item-key="id"
    handle="legend"
    :swap-threshold="0.5"
    :animation="300"
    ghost-class="ghost"
  >
    <template #item="{ element, index }">
      <li>
        <SampleListItem
          :file="element"
          :can-move-up="index > 0"
          :can-move-down="index < audioFilesStore.audioFiles.length - 1"
        />
      </li>
    </template>
  </draggable>
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
