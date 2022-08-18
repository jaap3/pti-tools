<script setup lang="ts">
  import { inject, ref } from "vue"
  import { AudioContextKey, AudioFile } from "@/types"

  const ctx: AudioContext | undefined = inject(AudioContextKey)

  const props = defineProps<{
    file: AudioFile
  }>()

  const emit = defineEmits<{
    (e: "play"): void
  }>()

  const isPlaying = ref<boolean>(false)

  let source: AudioBufferSourceNode | null = null

  function play() {
    if (!ctx) return
    emit("play")
    isPlaying.value = true
    const { audio: buffer } = props.file
    source = new AudioBufferSourceNode(ctx, { buffer })
    source.connect(ctx.destination)
    source.start(0)
  }

  function stop() {
    source?.stop()
    source?.disconnect()
    source = null
    isPlaying.value = false
  }

  defineExpose({
    play,
    stop,
    isPlaying,
  })
</script>

<template>
  <button :class="$attrs['class']" type="button" :title="`Play ${file.name}`" @click="play" v-if="!isPlaying">
    <span class="material-icons">play_arrow</span>
  </button>
  <button :class="$attrs['class']" type="button" :title="`Stop playing ${file.name}`" @click="stop" v-if="isPlaying">
    <span class="material-icons">stop</span>
  </button>
</template>
