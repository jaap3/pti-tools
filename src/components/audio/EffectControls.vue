<script setup lang="ts">
  import type { Layer, Slice } from "@/lib/app/types"

  import ControlsHolder from "./ControlsHolder.vue"
  import GainControl from "./GainControl.vue"
  import TrimControl from "./TrimControl.vue"

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
