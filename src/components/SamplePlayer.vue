<script setup lang="ts">
  import { inject } from "vue"
  import { AudioContextKey } from "@/types"

  const ctx: AudioContext | undefined = inject(AudioContextKey)

  const props = defineProps<{
    audioBuffer: AudioBuffer
  }>()

  const emit = defineEmits<{
    (e: "play"): void
  }>()

  let source: AudioBufferSourceNode | null = null

  function play() {
    if (!ctx) return
    emit("play")
    const { audioBuffer: buffer } = props
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
  <button type="button" @click="play"><span class="material-icons">play_arrow</span></button>
</template>
