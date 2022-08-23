<script setup lang="ts">
  import { watch } from "vue"
  import { storeToRefs } from "pinia"
  import { useMessages } from "@/stores/messages"
  import { useAudioFiles } from "@/stores/audiofiles"

  const messagesStore = useMessages()
  const audioFilesStore = useAudioFiles()

  const sizeThreshold = 1024 * 1024 * 10 // 10MB

  const { maxFiles, maxDuration } = audioFilesStore
  const { maxFilessReached, totalDuration, durationExceeded } =
    storeToRefs(audioFilesStore)

  watch(
    maxFilessReached,
    (newValue) => {
      messagesStore.removeMessage("max-slices-reached")
      if (newValue) {
        messagesStore.addMessage(
          `Max. files reached (${maxFiles}): Remove a file to enable the file loader.`,
          "info",
          { id: "max-slices-reached" },
        )
      }
    },
    { immediate: true },
  )

  watch(
    durationExceeded,
    (newValue) => {
      messagesStore.removeMessage("duration-exceeded")
      if (newValue) {
        messagesStore.addMessage(
          `Total duration exceeds ${maxDuration} (${totalDuration.value.toFixed(
            3,
          )}s): Remove a file to enable the file loader.`,
          "info",
          { id: "duration-exceeded" },
        )
      }
    },
    { immediate: true },
  )

  function displayBytes(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    for (const file of files) {
      if (file.size > sizeThreshold) {
        messagesStore.addMessage(
          `Rejected "${file.name}", too large (>${displayBytes(
            sizeThreshold,
          )}).`,
          "warning",
          { timeout: 8500 },
        )
        continue
      }
      audioFilesStore.addFile(file.name, await file.arrayBuffer())
    }
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
      :disabled="maxFilessReached || durationExceeded"
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
