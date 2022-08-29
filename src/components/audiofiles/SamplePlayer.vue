<script setup lang="ts">
  import { ref } from "vue"
  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SampleWaveform from "@/components/audiofiles/SampleWaveform.vue"

  const slicesStore = useSlices()
  const ctx = slicesStore.audioContext

  const props = defineProps<{
    file: AudioFile
  }>()

  const isPlaying = ref<boolean>(false)

  function play() {
    isPlaying.value = true
    const source = slicesStore.getAudioBufferSourceNode(props.file)
    source.addEventListener("ended", () => (isPlaying.value = false))
    source.connect(ctx.destination)
    source.start(0)
  }

  function stop() {
    slicesStore.stopPlayback()
    isPlaying.value = false
  }

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
