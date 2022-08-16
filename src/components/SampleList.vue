<script setup lang="ts">
  import { ref } from "vue"
  import SamplePlayer from "@/components/SamplePlayer.vue"
  import type { AudioFile } from "@/types"

  defineProps<{
    files: AudioFile[]
  }>()

  const emit = defineEmits<{
    (e: "moveUp", files: AudioFile): void
    (e: "moveDown", files: AudioFile): void
    (e: "remove", files: AudioFile): void
  }>()

  const samplePlayers = ref<InstanceType<typeof SamplePlayer>[]>([])

  function handleSamplePlays() {
    samplePlayers.value.forEach((player) => {
      player.stop()
    })
  }
</script>

<template>
  <ul>
    <li v-for="(file, idx) in files" :key="file.name">
      <fieldset>
        <legend>{{ file.name }}</legend>
        <SamplePlayer
          ref="samplePlayers"
          :audio-buffer="file.audio"
          @play="handleSamplePlays"
        />
        <button
          type="button"
          :disabled="idx === 0"
          @click="emit('moveUp', file)"
        >
          ←
        </button>
        <button
          type="button"
          :disabled="idx === files.length - 1"
          @click="emit('moveDown', file)"
        >
          →
        </button>
        <button type="button" @click.once="emit('remove', file)">␡</button>
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
