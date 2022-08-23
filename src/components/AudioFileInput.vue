<script setup lang="ts">
  import { inject } from "vue"
  import type { AudioFile } from "@/types"
  import { AudioContextKey } from "@/constants"
  import { useMessages } from "@/stores/messages"

  const messagesStore = useMessages()

  const sizeThreshold = 1024 * 1024 * 10
  const durationThreshold = 45
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

  function displayBytes(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  async function handleInput(evt: Event) {
    if (!ctx) return
    const input = evt.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    const audioFiles: AudioFile[] = []
    for (const file of files) {
      if (file.size > sizeThreshold) {
        messagesStore.addMessage(
          `"${file.name}" is too large (>${displayBytes(sizeThreshold)}).`,
          "warning",
          { timeout: 8500 },
        )
        continue
      }
      const audio = await ctx.decodeAudioData(await file.arrayBuffer())
      if (audio.duration > durationThreshold) {
        messagesStore.addMessage(
          `"${file.name}" is too long (>${durationThreshold}s).`,
          "warning",
          { timeout: 8500 },
        )
        continue
      }
      audioFiles.push({
        name: file.name,
        audio,
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
    outline: 1px dashed #fffefe;
    background: #0a0a0a;
    border-radius: 2rem;
    padding: 2rem;
    margin: 16px 0;
    text-align: center;
  }

  label:focus,
  label:focus-within {
    outline: 1px solid #731414;
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
