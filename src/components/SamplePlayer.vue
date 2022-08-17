<script setup lang="ts">
  import { inject } from "vue"
  import { AudioContextKey, AudioFile } from "@/types"

  const ctx: AudioContext | undefined = inject(AudioContextKey)

  const props = defineProps<{
    file: AudioFile
  }>()

  const emit = defineEmits<{
    (e: "play"): void
  }>()

  let source: AudioBufferSourceNode | null = null

  function play() {
    if (!ctx) return
    emit("play")
    const { audio: buffer } = props.file
    source = new AudioBufferSourceNode(ctx, { buffer })
    source.connect(ctx.destination)
    source.start(0)
  }

  function stop() {
    source?.stop()
    source?.disconnect()
    source = null
  }

  defineExpose({
    play,
    stop,
  })
</script>

<template>
  <button type="button" :title="`Play ${file.name}`" @click="play"><span class="material-icons">play_arrow</span></button>
</template>
