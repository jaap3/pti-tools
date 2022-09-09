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
  const DownloadPti = defineAsyncComponent(
    () => import("@/components/DownloadPti.vue"),
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

  async function handleFileInput(file: File) {
    if (fileLoaderDisabled.value) return
    await slicesStore.addSlice(file)
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
    <form @submit.prevent>
      <DownloadPti v-if="fileSelected" />
      <SlicesList v-if="fileSelected" />
      <AudioFileInput
        :disabled="fileLoaderDisabled"
        class="file-input"
        @input="handleFileInput"
      />
    </form>
  </AppContainer>
  <LayerEditor v-if="editSlice !== null" :slice="editSlice" />
</template>

<style>
  @import url(sanitize.css);
  @import url(sanitize.css/typography.css);
  @import url(sanitize.css/forms.css);
  @import url(material-icons/iconfont/filled.css);
  @import url(@fontsource/manrope/latin-300.css);
  @import url(@fontsource/manrope/latin-400.css);

  html,
  body {
    height: 100%;
  }

  body {
    background: #0a0a0a;
    color: #fffefe;
    font-weight: 300;
    font-family: "Manrope", sans-serif;
  }

  #app {
    height: 100%;
  }

  form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  input[type="text"],
  input[type="number"],
  button,
  select {
    border: 1px solid #767677;
    background-color: #0a0a0a;
  }

  button:not(:disabled) {
    cursor: pointer;
  }

  button:disabled {
    color: #767677;
  }
</style>
