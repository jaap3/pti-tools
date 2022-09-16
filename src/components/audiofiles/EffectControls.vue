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
    padding: 0 4px;
    border-right: 1px solid #767677;
  }

  :is(.controls :first-child) {
    padding-left: 0;
  }

  :is(.controls :last-child) {
    padding-right: 0;
    border-right: none;
  }
</style>
