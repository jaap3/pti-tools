<script setup lang="ts">
  import { ref } from "vue"
  import type { AudioFile } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"

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

  defineExpose({
    play,
    stop,
    isPlaying,
  })
</script>

<template>
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
</template>
