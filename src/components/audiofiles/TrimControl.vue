<script setup lang="ts">
  import { computed } from "vue"

  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()

  const props = defineProps<{
    file: AudioFile
  }>()

  /**
   * Handles the toggling of the trim control checkbox.
   * Sets the trim flag to "both" or "none" depending on whether the checkbox
   * is checked or not.
   *
   * @param evt - The input event.
   */
  function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
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
