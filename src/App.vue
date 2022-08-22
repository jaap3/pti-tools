<script setup lang="ts">
  import { provide, ref, defineAsyncComponent, computed, watch } from "vue"
  import type { Ref } from "vue"
  import type { AudioFile } from "@/types"
  import { AudioContextKey } from "@/types"

  import { sumChannels } from "@/audio-tools"
  import { MAX_SLICES } from "@/pti-file-format"

  import ShowMessages from "@/components/messages/ShowMessages.vue"
  import AudioFileInput from "@/components/AudioFileInput.vue"

  import { useMessages } from "@/stores/messages"

  const messagesStore = useMessages()

  const SampleList = defineAsyncComponent(
    () => import("@/components/SampleList.vue"),
  )
  const DownloadPti = defineAsyncComponent(
    () => import("@/components/DownloadPti.vue"),
  )

  const selectedFiles: Ref<AudioFile[]> = ref([])

  const maxSlicesReached = computed(
    () => selectedFiles.value.length >= MAX_SLICES,
  )

  const audioContext = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })

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
      messagesStore.addMessage("Audio context closed, please reload.", "error", {
        id: "audio-context-state",
      })
    }
  }

  audioContext.addEventListener("statechange", handleAudioContextStateChange)
  handleAudioContextStateChange()

  provide(AudioContextKey, audioContext)

  const activateAudioContext = () => {
    if (audioContext.state === "suspended") {
      audioContext.resume()
    }
  }

  function handleFilesSelected(files: AudioFile[]) {
    for (const file of files) {
      if (maxSlicesReached.value) {
        messagesStore.addMessage(
          `"${file.name}" not loaded, max. ${MAX_SLICES} slices reached.`,
          "warning",
        )
        break
      }
      file.audio = sumChannels(file.audio, audioContext)
      selectedFiles.value = [...selectedFiles.value, file]
    }
  }

  watch(selectedFiles, (newValue) => {
    if (newValue.length) {
      activateAudioContext()
    }
  })

  function moveFileUp(file: AudioFile) {
    const idx = selectedFiles.value.indexOf(file)
    selectedFiles.value.splice(idx, 1)
    selectedFiles.value.splice(idx - 1, 0, file)
  }

  function moveFileDown(file: AudioFile) {
    const idx = selectedFiles.value.indexOf(file)
    selectedFiles.value.splice(idx, 1)
    selectedFiles.value.splice(idx + 1, 0, file)
  }

  function removeFile(file: AudioFile) {
    selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1)
  }
</script>

<template>
  <main @click="activateAudioContext">
    <ShowMessages />
    <form>
      <AudioFileInput
        :disabled="maxSlicesReached"
        @files-selected="handleFilesSelected"
      />
      <SampleList
        v-if="selectedFiles.length > 0"
        :files="selectedFiles"
        @move-up="moveFileUp"
        @move-down="moveFileDown"
        @remove="removeFile"
      />
      <DownloadPti v-if="selectedFiles.length > 0" :files="selectedFiles" />
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
