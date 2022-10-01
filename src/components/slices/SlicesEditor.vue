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
  import { displayDuration } from "@/helpers/numberformat"
  import { maxDuration, maxSlices } from "@/lib/app/constants"
  import { useAudioContext } from "@/stores/audiocontext"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const SlicesList = defineAsyncComponent(() => import("./SlicesList.vue"))

  const slicesStore = useSlices()
  const messagesStore = useMessages()
  const { stopPlayback } = useAudioContext()

  const { durationExceeded, maxSlicesReached, totalDuration, totalSlices } =
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
    if (fileLoaderDisabled.value) return
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
      <div class="toolbar">
        <label
          >Slices:
          <output :value="totalSlices" :class="{ error: maxSlicesReached }"
        /></label>
        <label>
          Duration:
          <output
            :class="{ error: durationExceeded }"
            :value="displayDuration(totalDuration)"
        /></label>
        <DownloadFile class="download" />
      </div>
    </template>
    <template #main>
      <SlicesList />
    </template>
    <template #bottom>
      <AudioFileInput :disabled="fileLoaderDisabled" @input="handleFileInput" />
    </template>
  </AppLayout>
</template>

<style scoped>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
  }

  .toolbar > label {
    display: flex;
    align-items: center;
    min-height: 34px;
    padding: 0 8px 0 0;
    margin-right: 8px;
    border-right: 1px solid #767677;
  }

  output {
    margin-left: 4px;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }

  output.error {
    color: var(--medium-dark-red);
  }
</style>
