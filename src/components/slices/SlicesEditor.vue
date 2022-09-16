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
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const DownloadFile = defineAsyncComponent(
    () => import("@/components/audio/DownloadFile.vue"),
  )
  const SlicesList = defineAsyncComponent(() => import("./SlicesList.vue"))

  const slicesStore = useSlices()
  const messagesStore = useMessages()

  const { maxSlices, maxDuration } = slicesStore
  const { totalSlices, maxSlicesReached, durationExceeded } =
    storeToRefs(slicesStore)

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
    slicesStore.stopPlayback()
  })

  onUnmounted(() => {
    // Stop any audio playback when the dialog is closed.
    slicesStore.stopPlayback()
  })
</script>

<template>
  <form @submit.prevent>
    <DownloadFile v-if="totalSlices > 0" />
    <SlicesList v-if="totalSlices > 0" />
    <AudioFileInput
      :disabled="fileLoaderDisabled"
      class="file-input"
      @input="handleFileInput"
    />
  </form>
</template>

<style scoped>
  form {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
</style>
