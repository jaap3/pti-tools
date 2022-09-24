<script setup lang="ts">
  import { storeToRefs } from "pinia"

  import AudioList from "@/components/audio/AudioList.vue"
  import { useSlices } from "@/stores/slices"

  import LayerListItem from "./LayerListItem.vue"

  const slicesStore = useSlices()
  const { activeSliceLayers: layers } = storeToRefs(slicesStore)
</script>

<template>
  <AudioList>
    <template #title>Layers</template>
    <ol>
      <li v-for="layer in layers" :key="layer.id">
        <LayerListItem :layer="layer" :can-delete="layers.length > 1" />
      </li>
    </ol>
  </AudioList>
</template>
