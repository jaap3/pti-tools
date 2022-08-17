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

  function displayName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "")
  }
</script>

<template>
  <ul>
    <li v-for="(file, idx) in files" :key="file.name">
      <fieldset>
        <legend>{{ displayName(file.name) }}</legend>
        <div class="controls">
          <SamplePlayer
            ref="samplePlayers"
            :file="file"
            @play="handleSamplePlays"
          />
          <button
            type="button"
            :disabled="idx === 0"
            @click="emit('moveUp', file)"
            :title="`Move ${file.name} up one position`"
          >
            <span class="material-icons">arrow_back</span>
          </button>
          <button
            type="button"
            :disabled="idx === files.length - 1"
            @click="emit('moveDown', file)"
            :title="`Move ${file.name} down one position`"
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

  fieldset {
    margin: 0 2px 8px;
    padding: 8px;
  }

  legend {
    display: block;
    width: 100%;
    padding: 0 8px;
    background-color: #fff;
    color: #000;
    font-weight: 400;
    text-align: center;
    max-width: 144px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button {
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
  }

  .delete {
    background-color: tomato;
  }
</style>
