<script setup lang="ts">
import { ref } from "vue";
import SamplePlayer from "./SamplePlayer.vue";
import type { AudioFile } from "../types";

defineProps<{
  files: AudioFile[];
}>();

const emit = defineEmits<{
  (e: "moveUp", files: AudioFile): void;
  (e: "moveDown", files: AudioFile): void;
  (e: "remove", files: AudioFile): void;
}>();

const samplePlayers = ref<typeof SamplePlayer[]>([]);

function handleSamplePlays() {
  samplePlayers.value.forEach((player) => {
    player.stop();
  });
}
</script>

<template>
  <ul>
    <li v-for="(file, idx) in files" :key="file.name">
      <fieldset>
        <legend>{{ file.name }}</legend>
        <SamplePlayer
          :audio-buffer="file.audio"
          ref="samplePlayers"
          @play="handleSamplePlays"
        />
        <button @click="emit('moveUp', file)" :disabled="idx === 0">←</button>
        <button
          @click="emit('moveDown', file)"
          :disabled="idx === files.length - 1"
        >
          →
        </button>
        <button @click.once="emit('remove', file)">␡</button>
      </fieldset>
    </li>
  </ul>
</template>

<style scoped>
ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

button {
  font-family: system-ui, sans-serif;
  font-size: 1.2rem;
}
</style>
