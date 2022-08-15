<script setup lang="ts">
import { provide, ref } from "vue";
import type { Ref } from "vue";
import type { AudioFile } from "./types";
import { AudioContextKey } from "./types";

import { sumChannels } from "./audio-tools";
import { createBeatSlicedPtiFromSamples } from "./pti-file-format";

import AudioFileInput from "./components/AudioFileInput.vue";
import SampleList from "./components/SampleList.vue";

const selectedFiles: Ref<AudioFile[]> = ref([]);

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
  const audio = selectedFiles.value.map((file) => file.audio.getChannelData(0))
  const buffer = createBeatSlicedPtiFromSamples(audio);

  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("download", "output.pti");
  a.setAttribute("href", url);
  a.setAttribute("hidden", "");
  document.documentElement.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.documentElement.removeChild(a);
}
</script>

<template>
  <div @click="activateAudioContext">
    <AudioFileInput @files-selected="handleFilesSelected" />
    <SampleList
      :files="selectedFiles"
      @move-up="moveFileUp"
      @move-down="moveFileDown"
      @remove="removeFile"
    />
  </div>

  <button :disabled="selectedFiles.length === 0" @click="handleDownload">
    Download
  </button>
</template>

<style scoped></style>
