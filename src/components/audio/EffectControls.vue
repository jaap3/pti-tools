<script setup lang="ts">
  import ControlsHolder from "@/components/base/ControlsHolder.vue"
  import type { EditableAudioFile } from "@/lib/app/types"

  import GainControl from "./GainControl.vue"
  import TrimControl from "./TrimControl.vue"

  defineProps<{
    file: EditableAudioFile
  }>()
</script>

<template>
  <ControlsHolder class="controls" title="">
    <TrimControl :file="file" />
    <GainControl :file="file" />
  </ControlsHolder>
</template>

<style scoped>
  :where(.controls > *) {
    padding: 0 4px;
    border-right: 1px solid #767677;
  }

  :where(.controls > :first-child) {
    padding-left: 0;
  }

  :where(.controls > :last-child) {
    padding-right: 0;
    border-right: none;
  }
</style>
