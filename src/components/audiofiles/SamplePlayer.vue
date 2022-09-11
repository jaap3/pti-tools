<script setup lang="ts">
  import { ref } from "vue"

  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SampleWaveform from "@/components/audiofiles/SampleWaveform.vue"
  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()
  const ctx = slicesStore.audioContext

  const props = defineProps<{
    file: AudioFile
  }>()

  const isPlaying = ref<boolean>(false)

  /**
   * Plays the audio file. Any other playing audio file is stopped.
   */
  function play() {
    isPlaying.value = true
    const source = slicesStore.getAudioBufferSourceNode(props.file)
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
  <SampleWaveform :file="file" @click="togglePlayback" />
  <ControlsHolder class="controls">
    <ButtonControl
      v-if="!isPlaying"
      :title="`Play ${file.name}`"
      icon="play_arrow"
      @click="play"
    />
    <ButtonControl
      v-if="isPlaying"
      :title="`Stop playing ${file.name}`"
      icon="stop"
      @click="stop"
    />
    <slot name="controls" />
  </ControlsHolder>
</template>

<style scoped>
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
