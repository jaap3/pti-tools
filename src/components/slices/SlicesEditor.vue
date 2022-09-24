<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import {
    computed,
    defineAsyncComponent,
    onMounted,
    onUnmounted,
    watch,
  } from "vue"

  import AudioFileInput from "@/components/audio/AudioFileInput.vue"
  import DownloadFile from "@/components/audio/DownloadFile.vue"
  import AppLayout from "@/components/base/AppLayout.vue"
  import { maxDuration, maxSlices } from "@/lib/app/constants"
  import { useAudioContext } from "@/stores/audiocontext"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const SlicesList = defineAsyncComponent(() => import("./SlicesList.vue"))

  const slicesStore = useSlices()
  const messagesStore = useMessages()
  const { stopPlayback } = useAudioContext()

  const { maxSlicesReached, durationExceeded } = storeToRefs(slicesStore)

  const fileLoaderDisabled = computed(
    () => maxSlicesReached.value || durationExceeded.value,
  )

  /**
   * Loads the audio file(s) selected/dropped by the user.
   * Does nothing if the input is disabled.
   *
   * @param file - The audio file to load.
   */
  async function handleFileInput(file: File) {
    const error = await slicesStore.addSlice(file)
    if (error) {
      const { text, level } = error
      messagesStore.addMessage(text, level, { timeout: 8500 })
    }
  }

  watch(
    maxSlicesReached,
    (newValue) => {
      messagesStore.removeMessage("max-slices-reached")
      if (newValue) {
        messagesStore.addMessage(
          `Max. files reached (${maxSlices}): Remove one or more files to enable the file loader.`,
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
          `Total duration exceeds ${maxDuration}: Remove one or more files to enable the file loader.`,
          "info",
          { id: "duration-exceeded" },
        )
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    // Stop any audio playback when the dialog is opened.
    stopPlayback()
  })

  onUnmounted(() => {
    // Stop any audio playback when the dialog is closed.
    stopPlayback()
  })
</script>

<template>
  <AppLayout>
    <template #top>
      <DownloadFile />
    </template>
    <template #main>
      <SlicesList :can-duplicate="!fileLoaderDisabled" />
    </template>
    <template #bottom>
      <AudioFileInput :disabled="fileLoaderDisabled" @input="handleFileInput" />
    </template>
  </AppLayout>
</template>
