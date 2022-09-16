<script setup lang="ts">
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import GainControl from "@/components/audiofiles/GainControl.vue"
  import TrimControl from "@/components/audiofiles/TrimControl.vue"
  import type { Layer, Slice } from "@/lib/app/types"

  defineProps<{
    file: Layer | Slice
  }>()
</script>

<template>
  <ControlsHolder>
    <TrimControl :file="file" />
    <GainControl :file="file" />
  </ControlsHolder>
</template>

<style scoped>
  :is(.controls > *) {
    margin: 0 4px;
  }

  :is(.controls :first-child) {
    margin-left: 0;
  }

  :is(.controls :last-child) {
    margin-right: 0;
  }
</style>
