<script setup lang="ts">
  import { ref } from "vue"
  import SamplePlayer from "@/components/SamplePlayer.vue"
  import SampleDisplay from "@/components/SampleDisplay.vue"
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

  function displayName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "")
  }
</script>

<template>
  <ul>
    <li v-for="(file, idx) in files" :key="file.name">
      <fieldset>
        <legend>{{ displayName(file.name) }}</legend>
        <SampleDisplay :file="file" />
        <div class="controls">
          <SamplePlayer
            ref="samplePlayers"
            :file="file"
            class="play" @play="handleSamplePlays"
          />
          <button
            type="button"
            :disabled="idx === 0"
            :title="`Move ${file.name} up one position`"
            @click="emit('moveUp', file)"
          >
            <span class="material-icons">arrow_back</span>
          </button>
          <button
            type="button"
            :disabled="idx === files.length - 1"
            :title="`Move ${file.name} down one position`"
            @click="emit('moveDown', file)"
          >
            <span class="material-icons">arrow_forward</span>
          </button>
          <button type="button" class="delete" @click.once="emit('remove', file)">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </fieldset>
    </li>
  </ul>
</template>

<style scoped>
  ul {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 8px 0;
  }

  li:nth-child(3n+2) {
    margin: 8px 8px;
  }

  fieldset {
    width: 300px;
    padding: 8px 0;
    overflow: hidden;
  }

  legend {
    display: block;
    width: 100%;
    padding: 0 8px;
    background-color: #fff;
    color: #000;
    font-weight: 400;
    text-align: center;
    max-width: 256px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .controls {
    display: flex;
    margin-top: 8px;
    justify-content: center;
    align-items: center;
  }

  button {
    font-size: 1.2rem;
    margin: 0 8px;
    width: 40px;
    height: 40px;
  }

  .play {
    margin-left: 8px;
    margin-right: auto;
  }

  .delete {
    background-color: tomato;
    margin-left: auto;
    margin-right: 8px;
  }
</style>
