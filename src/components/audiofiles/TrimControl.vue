<script setup lang="ts">
  import { computed } from "vue"
  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()

  const props = defineProps<{
    file: AudioFile
  }>()

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement
    slicesStore.trimAudio(props.file, input.checked ? "both" : "none")
  }

  const checked = computed(() => {
    return props.file.options.trim === "both"
  })
</script>

<template>
  <label
    >Trim silence:
    <input :checked="checked" type="checkbox" @input="handleInput"
  /></label>
</template>
