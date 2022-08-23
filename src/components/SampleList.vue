<script setup lang="ts">
  import { ref } from "vue"
  import SampleListItem from "@/components/SampleListItem.vue"
  import { useAudioFiles } from "@/stores/audiofiles"

  const audioFilesStore = useAudioFiles()
  const sampleListItems = ref<InstanceType<typeof SampleListItem>[]>([])

  function handleSamplePlays() {
    sampleListItems.value.forEach((item) => {
      item.stop()
    })
  }
</script>

<template>
  <ol>
    <li v-for="(file, idx) in audioFilesStore.audioFiles" :key="file.name">
      <SampleListItem
        ref="sampleListItems"
        :file="file"
        :can-move-up="idx > 0"
        :can-move-down="idx < audioFilesStore.audioFiles.length - 1"
        @play="handleSamplePlays"
        @move-down="audioFilesStore.moveFileDown"
        @move-up="audioFilesStore.moveFileUp"
        @remove="audioFilesStore.removeFile"
        @trim="(file, option) => audioFilesStore.trimFile(file, option)"
      />
    </li>
  </ol>
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
