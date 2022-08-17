<script setup lang="ts">
  import { provide, ref, computed, defineAsyncComponent } from "vue"
  import type { Ref, ComputedRef } from "vue"
  import type { AudioFile } from "@/types"
  import { AudioContextKey } from "@/types"

  import { sumChannels } from "@/audio-tools"
  import { MAX_SLICES, createBeatSlicedPtiFromSamples } from "@/pti-file-format"

  import AudioFileInput from "@/components/AudioFileInput.vue"

  const SampleList = defineAsyncComponent(() => import("@/components/SampleList.vue"))

  const selectedFiles: Ref<AudioFile[]> = ref([])
  const instrumentName: Ref<string> = ref("")
  const instrumentNameInput: Ref<HTMLInputElement | null> = ref(null)
  const instrumentNameValid: ComputedRef<boolean> = computed(
    () =>
      instrumentName.value === "" ||
      (instrumentNameInput.value?.reportValidity() ?? false),
  )

  const audioContext = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })

  provide(AudioContextKey, audioContext)

  const activateAudioContext = () => {
    if (audioContext.state === "suspended") {
      audioContext.resume()
    }
  }

  function handleFilesSelected(files: AudioFile[]) {
    for (const file of files) {
      if (selectedFiles.value.length >= MAX_SLICES) break
      file.audio = sumChannels(file.audio, audioContext)
      selectedFiles.value.push(file)
    }
  }

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

  async function handleDownload() {
    const audio = selectedFiles.value.map((file) =>
      file.audio.getChannelData(0),
    )
    const buffer = createBeatSlicedPtiFromSamples(audio, instrumentName.value)

    const blob = new Blob([buffer], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("download", `${instrumentName.value || "stitched"}.pti`)
    a.setAttribute("href", url)
    a.setAttribute("hidden", "")
    document.documentElement.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.documentElement.removeChild(a)
  }
</script>

<template>
  <main>
    <form>
      <div @click="activateAudioContext">
        <AudioFileInput
          :disabled="selectedFiles.length >= MAX_SLICES"
          @files-selected="handleFilesSelected"
        />
        <SampleList
          v-if="selectedFiles.length > 0"
          :files="selectedFiles"
          @move-up="moveFileUp"
          @move-down="moveFileDown"
          @remove="removeFile"
        />
      </div>
      <label
        >Instrument name
        <input
          ref="instrumentNameInput"
          v-model="instrumentName"
          type="text"
          maxlength="31"
          pattern="^[\x20-\x7E]+$"
      /></label>
      <button
        :disabled="!(instrumentNameValid && selectedFiles.length > 0)"
        type="button"
        @click="handleDownload"
      >
        Download
      </button>
    </form>
  </main>
</template>

<style>
  @import url(sanitize.css);
  @import url(sanitize.css/typography.css);
  @import url(sanitize.css/forms.css);
  @import url(material-icons/iconfont/filled.css);

  body {
    background: #121212;
    color: #fff;
    font-weight: lighter;
    height: 100%;
  }

  main {
    display: flex;
    flex-direction: column;
    max-width: 960px;
    height: 100%;
    margin: 0 auto;
    padding: 0 16px;
  }

  input[type=text],
  input[type=number],
  button,
  select {
    border: 1px solid #777;
    background-color: #101010;
  }

  button {
    cursor: pointer;
  }
</style>

<style scoped>
  input:invalid {
    outline: 2px solid tomato;
  }
</style>
