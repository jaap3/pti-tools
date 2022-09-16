<script setup lang="ts">
  import { computed, ref, withDefaults } from "vue"

  import { useSlices } from "@/stores/slices"

  import ButtonControl from "./ButtonControl.vue"
  import ControlsHolder from "./ControlsHolder.vue"
  import SampleWaveform from "./SampleWaveform.vue"

  const slicesStore = useSlices()
  const ctx = slicesStore.audioContext

  const props = withDefaults(
    defineProps<{
      audio: Float32Array
      name: string
      showWaveform?: boolean
    }>(),
    { showWaveform: true },
  )

  const isPlaying = ref<boolean>(false)

  const buttonTitle = computed(() => {
    return isPlaying.value
      ? `Stop playing "${props.name}"`
      : `Play "${props.name}"`
  })

  const buttonIcon = computed(() => {
    return isPlaying.value ? "stop" : "play_arrow"
  })

  /**
   * Plays the audio file. Any other playing audio file is stopped.
   */
  function play() {
    isPlaying.value = true
    const source = slicesStore.getAudioBufferSourceNode(props.audio)
    source.addEventListener("ended", () => (isPlaying.value = false))
    source.connect(ctx.destination)
    source.start(0)
  }

  /**
   * Stop the playback of any audio that has been started by this component.
   */
  function stop() {
    if (!isPlaying.value) return
    slicesStore.stopPlayback()
    isPlaying.value = false
  }

  /**
   * Toggle the playback of the audio file (i.e. play when stopped,
   * stop when playing).
   */
  function togglePlayback() {
    isPlaying.value ? stop() : play()
  }

  defineExpose({
    play,
    stop,
    isPlaying,
  })
</script>

<template>
  <SampleWaveform
    v-if="showWaveform"
    :audio="audio"
    class="waveform"
    @click="togglePlayback"
  />
  <ControlsHolder class="controls">
    <ButtonControl
      :title="buttonTitle"
      :icon="buttonIcon"
      @click="togglePlayback"
    />
    <slot name="controls" />
  </ControlsHolder>
</template>

<style scoped>
  .waveform {
    cursor: pointer;
  }

  :is(.controls button) {
    margin: 0 8px;
  }

  :is(.controls :first-child) {
    margin-left: 0;
  }

  :is(.controls :last-child) {
    margin-right: 0;
  }
</style>
