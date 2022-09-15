<script setup lang="ts">
  import { computed } from "vue"
  import { ref, watch } from "vue"

  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()

  const props = defineProps<{
    file: AudioFile
  }>()

  const inputId = computed(() => `gain-control-${props.file.id}`)

  const gain = ref(props.file.options.gain)

  let debounce: ReturnType<typeof setTimeout> | null = null
  watch(gain, async () => {
    if (debounce !== null) clearTimeout(debounce)
    debounce = setTimeout(async () => {
      debounce = null
      await slicesStore.setGain(props.file, gain.value)
    }, 1000 / 60)
  })

  /**
   * Handles scrolling on the gain control.
   * Updates the gain value.
   *
   * @param evt - The scroll event.
   */
  function handleWheel(evt: WheelEvent) {
    evt.preventDefault()
    gain.value += Math.sign(evt.deltaY) * -0.1
  }
</script>

<template>
  <label>
    <span>Gain:</span>
    <input
      :id="inputId"
      v-model.number="gain"
      type="range"
      min="-24"
      max="24"
      step="0.1"
      @wheel="handleWheel"
      @dblclick="gain = 0"
    />
    <output :for="inputId">{{ gain.toFixed(1) }} dB</output>
  </label>
</template>

<style scoped>
  label {
    display: flex;
  }

  span {
    padding-right: 8px;
  }

  input[type="range"] {
    flex: 0 1 calc(100% - 8px);
    width: 112px;
    height: 1.5em;
    cursor: pointer;
    background-color: #101010;
    border: 1px solid #777;
    appearance: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    height: 100%;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 100%;
    background: #fff;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 100%;
    background: #fff;
    border: 0;
    border-radius: 0;
    appearance: none;
  }

  output {
    flex: 0 0 4em;
    text-align: right;
    vertical-align: baseline;
  }
</style>
