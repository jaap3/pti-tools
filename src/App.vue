<script setup lang="ts">
import { provide, ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { AudioFile } from "./types";
import { AudioContextKey } from "./types";

import { sumChannels } from "./audio-tools";
import { MAX_SLICES, createBeatSlicedPtiFromSamples } from "./pti-file-format";

import AudioFileInput from "./components/AudioFileInput.vue";
import SampleList from "./components/SampleList.vue";

const selectedFiles: Ref<AudioFile[]> = ref([]);
const instrumentName: Ref<string> = ref("");
const instrumentNameInput: Ref<HTMLInputElement | null> = ref(null);
const instrumentNameValid: ComputedRef<boolean> = computed(
  () =>
    instrumentName.value === "" ||
    (instrumentNameInput.value?.reportValidity() ?? false)
);

const audioContext = new AudioContext({
  latencyHint: "interactive",
  sampleRate: 44100,
});

provide(AudioContextKey, audioContext);

const activateAudioContext = () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};

function handleFilesSelected(files: AudioFile[]) {
  for (const file of files) {
    if (selectedFiles.value.length >= MAX_SLICES) break;
    file.audio = sumChannels(file.audio, audioContext);
    selectedFiles.value.push(file);
  }
}

function moveFileUp(file: AudioFile) {
  const idx = selectedFiles.value.indexOf(file);
  selectedFiles.value.splice(idx, 1);
  selectedFiles.value.splice(idx - 1, 0, file);
}

function moveFileDown(file: AudioFile) {
  const idx = selectedFiles.value.indexOf(file);
  selectedFiles.value.splice(idx, 1);
  selectedFiles.value.splice(idx + 1, 0, file);
}

function removeFile(file: AudioFile) {
  selectedFiles.value.splice(selectedFiles.value.indexOf(file), 1);
}

async function handleDownload() {
  const audio = selectedFiles.value.map((file) => file.audio.getChannelData(0));
  const buffer = createBeatSlicedPtiFromSamples(audio, instrumentName.value);

  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("download", `${instrumentName.value || "stitched"}.pti`);
  a.setAttribute("href", url);
  a.setAttribute("hidden", "");
  document.documentElement.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.documentElement.removeChild(a);
}
</script>

<template>
  <form>
    <div @click="activateAudioContext">
      <AudioFileInput
        @files-selected="handleFilesSelected"
        :disabled="selectedFiles.length >= MAX_SLICES"
      />
      <SampleList
        :files="selectedFiles"
        @move-up="moveFileUp"
        @move-down="moveFileDown"
        @remove="removeFile"
      />
    </div>
    <label
      >Instrument name
      <input
        type="text"
        maxlength="31"
        v-model="instrumentName"
        pattern="^[\x20-\x7E]+$"
        ref="instrumentNameInput"
    /></label>
    <button
      :disabled="!(instrumentNameValid && selectedFiles.length > 0)"
      type="button"
      @click="handleDownload"
    >
      Download
    </button>
  </form>
</template>

<style scoped>
input:invalid {
  outline: 2px solid red;
}
</style>
