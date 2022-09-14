<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed, defineAsyncComponent, watch } from "vue"

  import AppContainer from "@/components/AppContainer.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const SlicesList = defineAsyncComponent(
    () => import("@/components/audiofiles/SlicesList.vue"),
  )
  const DownloadFile = defineAsyncComponent(
    () => import("@/components/DownloadFile.vue"),
  )
  const LayerEditor = defineAsyncComponent(
    () => import("@/components/audiofiles/LayerEditor.vue"),
  )

  const slicesStore = useSlices()
  const messagesStore = useMessages()
  const audioContext = slicesStore.audioContext

  const { maxSlices, maxDuration } = slicesStore
  const { totalSlices, editSlice, maxSlicesReached, durationExceeded } =
    storeToRefs(slicesStore)

  const fileLoaderDisabled = computed(
    () => maxSlicesReached.value || durationExceeded.value,
  )

  /**
   * Handles state changes in the audio context.
   * Adds relevant messages to the messages store depending on which state
   * the audio context transitioned to.
   */
  function handleAudioContextStateChange() {
    messagesStore.removeMessage("audio-context-state")
    if (audioContext?.state === "suspended") {
      messagesStore.addMessage("Load a file to enable audio.", "info", {
        id: "audio-context-state",
      })
    } else if (audioContext?.state === "running") {
      messagesStore.addMessage("Audio enabled.", "success", {
        id: "audio-context-state",
        timeout: 950,
      })
    } else {
      messagesStore.addMessage(
        "Audio context closed, please reload.",
        "error",
        {
          id: "audio-context-state",
        },
      )
    }
  }

  audioContext?.addEventListener("statechange", handleAudioContextStateChange)
  handleAudioContextStateChange()

  const activateAudioContext = () => {
    if (audioContext?.state === "suspended") {
      audioContext?.resume()
    }
  }

  /**
   * Loads the audio file(s) selected/dropped by the user.
   * Does nothing if the input is disabled.
   *
   * @param file - The audio file to load.
   */
  async function handleFileInput(file: File) {
    const error = await slicesStore.addSlice(file)
    if (error) {
      messagesStore.addMessage(error.message, error.level, { timeout: 8500 })
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

  const fileSelected = computed(() => {
    if (!fileSelected.value && totalSlices.value === 0) {
      return false
    }
    return true
  })
</script>

<template>
  <AppContainer
    tag="main"
    :show-appreciation="fileSelected"
    @click="activateAudioContext"
  >
    <form v-if="editSlice === null" @submit.prevent>
      <DownloadFile v-if="fileSelected" />
      <SlicesList v-if="fileSelected" />
      <AudioFileInput
        :disabled="fileLoaderDisabled"
        class="file-input"
        @input="handleFileInput"
      />
    </form>
  </AppContainer>
  <LayerEditor v-if="editSlice !== null" />
</template>

<style>
  @import "sanitize.css";
  @import "sanitize.css/typography.css";
  @import "sanitize.css/forms.css";
  @import "material-icons/iconfont/filled.css";
  @import "@fontsource/manrope/latin-300.css";
  @import "@fontsource/manrope/latin-400.css";

  html,
  body {
    height: 100%;
  }

  body {
    font-family: Manrope, sans-serif;
    font-weight: 300;
    color: #fffefe;
    background: #0a0a0a;
  }

  #app {
    height: 100%;
  }

  form {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  input[type="text"],
  input[type="number"],
  button,
  select {
    background-color: #0a0a0a;
    border: 1px solid #767677;
  }

  button:not(:disabled) {
    cursor: pointer;
  }

  button:disabled {
    color: #767677;
  }
</style>
