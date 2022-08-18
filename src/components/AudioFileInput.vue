<script setup lang="ts">
  import { inject } from "vue"
  import type { AudioFile } from "@/types"
  import { AudioContextKey } from "@/types"

  const ctx: AudioContext | undefined = inject(AudioContextKey)

  defineProps({
    disabled: {
      type: Boolean,
      default: false,
      required: true,
    },
  })

  const emit = defineEmits<{
    (e: "filesSelected", files: AudioFile[]): void
  }>()

  async function handleInput(evt: Event) {
    if (!ctx) return
    const input = evt.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    const audioFiles: AudioFile[] = []
    for (const file of files) {
      audioFiles.push({
        name: file.name,
        audio: await ctx.decodeAudioData(await file.arrayBuffer()),
      })
    }
    emit("filesSelected", audioFiles)
  }
</script>

<template>
  <label>
    Choose or drop an audio file
    <small
      >(<code>.wav</code>,&nbsp;<code>.mp3</code>,&nbsp;<code>.flac</code>,
      etc.)</small
    >
    <input
      multiple
      type="file"
      accept="audio/*"
      :disabled="disabled"
      @input="handleInput"
    />
  </label>
</template>

<style scoped>
  label {
    display: block;
    position: relative;
    width: 100%;
    outline: 1px dashed #cfcfcf;
    background: #0a0a0a;
    border-radius: 2rem;
    padding: 2rem;
    margin: 16px 0;
    text-align: center;
  }

  label:focus,
  label:focus-within {
    outline: 1px solid #651f1f;
  }

  input {
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
</style>
