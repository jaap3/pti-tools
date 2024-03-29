<script setup lang="ts">
  import { defineAsyncComponent, ref } from "vue"

  import AudioFileInput from "@/components/audio/AudioFileInput.vue"
  import AppContainer from "@/components/base/AppContainer.vue"
  import { useAudioContext } from "@/stores/audiocontext"
  import { useMessages } from "@/stores/messages"

  const LazyApp = defineAsyncComponent(() => import("./LazyApp.vue"))

  const messagesStore = useMessages()
  const audioContextStore = useAudioContext()

  const { ctx: audioContext } = audioContextStore

  /**
   * Handles state changes in the audio context.
   * Adds relevant messages to the messages store depending on which state
   * the audio context transitioned to.
   */
  function handleAudioContextStateChange() {
    messagesStore.removeMessage("audio-context-state")
    if (audioContext.state === "suspended") {
      messagesStore.addMessage("Load a file to enable audio.", "info", {
        id: "audio-context-state",
      })
    } else if (audioContext.state === "running") {
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

  audioContext.addEventListener("statechange", handleAudioContextStateChange)
  handleAudioContextStateChange()

  const activateAudioContext = () => {
    if (audioContext.state === "suspended") {
      audioContext.resume()
    }
  }

  /**
   * Loads the audio file(s) selected/dropped by the user.
   * @param file - The audio file to load.
   */
  async function handleFileInput(file: File) {
    const { useSlices } = await import("@/stores/slices")
    const error = await useSlices().addSlice(file)
    if (error) {
      const { text, level } = error
      messagesStore.addMessage(text, level, { timeout: 8500 })
    } else {
      activateAudioContext()
      audioLoaded.value = true
    }
  }

  const audioLoaded = ref(false)
</script>

<template>
  <AppContainer
    tag="main"
    :show-appreciation="audioLoaded"
    @click="activateAudioContext"
  >
    <LazyApp v-if="audioLoaded" />
    <AudioFileInput v-else style="margin-top: 16px" @input="handleFileInput" />
  </AppContainer>
</template>

<style>
  @import url("sanitize.css");
  @import url("sanitize.css/typography.css");
  @import url("sanitize.css/forms.css");
  @import url("material-icons/iconfont/filled.css");
  @import url("@fontsource/manrope/latin-300.css");
  @import url("@fontsource/manrope/latin-400.css");

  :root {
    --almost-black: #0a0a0a;
    --near-black: #121212;
    --almost-white: #fefefe;
    --medium-gray: #767676;
    --medium-dark-red: #731414;

    color: var(--almost-white);
    background-color: var(--almost-black);
    scrollbar-gutter: stable;
  }

  body {
    font-family: Manrope, sans-serif;
    font-weight: 300;
  }

  input[type="text"],
  input[type="number"],
  button,
  select {
    background-color: var(--almost-black);
    border: 1px solid var(--medium-gray);
  }

  button:not(:disabled) {
    cursor: pointer;
  }

  button:disabled {
    color: var(--medium-gray);
  }
</style>
