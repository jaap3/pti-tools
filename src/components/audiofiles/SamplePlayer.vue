<script setup lang="ts">
  import { ref } from "vue"
  import type { AudioFile } from "@/stores/audiofiles"
  import { useAudioFiles } from "@/stores/audiofiles"

  const audioFilesStore = useAudioFiles()
  const ctx = audioFilesStore.audioContext

  const props = defineProps<{
    file: AudioFile
  }>()

  const isPlaying = ref<boolean>(false)

  function play() {
    isPlaying.value = true
    const source = audioFilesStore.getAudioBufferSourceNode(props.file)
    source.addEventListener("ended", () => (isPlaying.value = false))
    source.connect(ctx.destination)
    source.start(0)
  }

  function stop() {
    audioFilesStore.stopPlayback()
    isPlaying.value = false
  }

  defineExpose({
    play,
    stop,
    isPlaying,
  })
</script>

<template>
  <button
    v-if="!isPlaying"
    :class="$attrs['class']"
    type="button"
    :title="`Play ${file.name}`"
    @click="play"
  >
    <span class="material-icons">play_arrow</span>
  </button>
  <button
    v-if="isPlaying"
    :class="$attrs['class']"
    type="button"
    :title="`Stop playing ${file.name}`"
    @click="stop"
  >
    <span class="material-icons">stop</span>
  </button>
</template>
