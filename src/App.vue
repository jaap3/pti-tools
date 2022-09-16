<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed, defineAsyncComponent } from "vue"

  import AppContainer from "@/components/AppContainer.vue"
  import SlicesEditor from "@/components/slices/SlicesEditor.vue"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const LayerEditor = defineAsyncComponent(
    () => import("@/components/layers/LayerEditor.vue"),
  )

  const slicesStore = useSlices()
  const messagesStore = useMessages()
  const audioContext = slicesStore.audioContext

  const { totalSlices, activeSliceId } = storeToRefs(slicesStore)

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
    <SlicesEditor v-if="activeSliceId === null" />
    <LayerEditor v-else />
  </AppContainer>
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
