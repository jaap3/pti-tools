<script setup lang="ts">
  import { defineAsyncComponent, computed } from "vue"

  import ShowMessages from "@/components/messages/ShowMessages.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"

  import { useAudioFiles } from "@/stores/audiofiles"
  import { useMessages } from "@/stores/messages"

  const SampleList = defineAsyncComponent(() => import("@/components/audiofiles/SampleList.vue"))
  const DownloadPti = defineAsyncComponent(() => import("@/components/DownloadPti.vue"))

  const audioFilesStore = useAudioFiles()
  const messagesStore = useMessages()
  const audioContext = audioFilesStore.audioContext

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
    if (!fileSelected.value && audioFilesStore.audioFiles.length === 0) {
      return false
    }
    return true
  })
</script>

<template>
  <main @click="activateAudioContext">
    <ShowMessages />
    <form @submit.prevent>
      <AudioFileInput />
      <SampleList v-if="fileSelected" />
      <DownloadPti v-if="fileSelected" />
    </form>
  </main>
</template>

<style>
  @import url(sanitize.css);
  @import url(sanitize.css/typography.css);
  @import url(sanitize.css/forms.css);
  @import url(material-icons/iconfont/filled.css);
  @import url(@fontsource/manrope/latin-300.css);
  @import url(@fontsource/manrope/latin-400.css);

  body {
    background: #0a0a0a;
    color: #fffefe;
    font-weight: lighter;
    height: 100%;
    font-family: "Manrope", sans-serif;
  }

  main {
    display: flex;
    flex-direction: column;
    max-width: 960px;
    height: 100%;
    margin: 0 auto;
    padding: 0 16px;
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
