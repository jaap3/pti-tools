<script setup lang="ts">
  import { computed } from "vue"

  import type { EditableAudioFile } from "@/lib/app/types"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()

  const props = defineProps<{
    file: EditableAudioFile
  }>()

  /**
   * Handles the toggling of the trim control checkbox.
   * Sets the trim flag to "both" or "none" depending on whether the checkbox
   * is checked or not.
   * @param evt - The input event.
   */
  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    await slicesStore.trimAudio(props.file, input.checked ? "both" : "none")
  }

  const checked = computed(() => {
    return props.file.options.trim === "both"
  })
</script>

<template>
  <label
    ><input
      :checked="checked"
      type="checkbox"
      title="Trim silence from start and end"
      @input="handleInput"
    />
    <span>Trim</span>
    <span class="material-icons">{{
      checked ? "check_box" : "check_box_outline_blank"
    }}</span></label
  >
</template>

<style scoped>
  label {
    position: relative;
    display: flex;
    align-items: center;
  }

  .material-icons {
    margin-left: 2px;
    font-size: 1.2em;
  }

  input,
  input:checked {
    position: absolute;
    inset: 0;
    appearance: none;
    cursor: pointer;
    border: none;
  }
</style>
