<script setup lang="ts">
import { inject } from "vue";
import type { AudioFile } from "../types";
import { AudioContextKey } from "../types";

const ctx: AudioContext | undefined = inject(AudioContextKey);

const emit = defineEmits<{
  (e: "filesSelected", files: AudioFile[]): void;
}>();

async function handleInput(evt: Event) {
  if (!ctx) return;
  const input = evt.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  const audioFiles: AudioFile[] = [];
  for (const file of files) {
    audioFiles.push({
      name: file.name,
      audio: await ctx.decodeAudioData(await file.arrayBuffer()),
    });
  }
  emit("filesSelected", audioFiles);
}
</script>

<template>
  <input multiple type="file" accept="audio/*" @input="handleInput" />
</template>
