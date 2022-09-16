<script setup lang="ts">
  import { computed, onMounted, onUnmounted } from "vue"
  import { ref, watch } from "vue"

  import type { Layer, Slice } from "@/lib/app/types"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()

  const props = defineProps<{
    file: Layer | Slice
  }>()

  const inputId = computed(() => `gain-control-${props.file.id}`)

  const DEFAULT_STEP = 0.1
  const SHIFT_STEP = 1
  const step = ref(DEFAULT_STEP)
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
    gain.value += Math.sign(evt.deltaY) * -step.value
  }

  /**
   * Updates the step size when the shift key is pressed.
   *
   * @param evt - The keydown event.
   */
  function handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Shift") step.value = SHIFT_STEP
  }

  /**
   * Updates the step size when the shift key is released.
   *
   * @param evt - The keyup event.
   */
  function handleKeyUp(evt: KeyboardEvent) {
    if (evt.key === "Shift") step.value = DEFAULT_STEP
  }

  onMounted(() => {
    addEventListener("keydown", handleKeyDown)
    addEventListener("keyup", handleKeyUp)
  })

  onUnmounted(() => {
    removeEventListener("keydown", handleKeyDown)
    removeEventListener("keyup", handleKeyUp)
  })
</script>

<template>
  <label>
    <span>Gain</span>
    <input
      :id="inputId"
      v-model.number="gain"
      type="range"
      min="-24"
      max="24"
      :step="step"
      @wheel="handleWheel"
      @dblclick="gain = 0"
    />
    <output :for="inputId">{{ gain.toFixed(1) }} dB</output>
  </label>
</template>

<style scoped>
  label {
    display: flex;
    align-items: center;
  }

  input[type="range"] {
    flex: 0 1 calc(100% - 8px);
    width: 112px;
    height: 1.4em;
    margin-left: 4px;
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
