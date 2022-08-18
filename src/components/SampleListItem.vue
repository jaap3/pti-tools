<script setup lang="ts">
  import { ref } from "vue"
  import type { AudioFile } from "@/types"
  import SamplePlayer from "@/components/SamplePlayer.vue"
  import SampleWaveform from "@/components/SampleWaveform.vue"

  defineProps<{
    file: AudioFile
    canMoveUp: boolean
    canMoveDown: boolean
  }>()

  const emit = defineEmits<{
    (e: "moveUp", files: AudioFile): void
    (e: "moveDown", files: AudioFile): void
    (e: "remove", files: AudioFile): void
    (e: "play"): void
  }>()

  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)

  function displayName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "")
  }

  function stop() {
    samplePlayer.value?.stop()
  }

  defineExpose({
    stop,
  })
</script>
<template>
  <fieldset>
    <legend>
      {{ displayName(file.name) }}
    </legend>
    <SampleWaveform :file="file" />
    <div class="controls">
      <SamplePlayer
        ref="samplePlayer"
        :file="file"
        class="play"
        @play="() => emit('play')"
      />
      <button
        type="button"
        :disabled="!canMoveUp"
        :title="`Move ${file.name} up one position`"
        @click="emit('moveUp', file)"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <button
        type="button"
        :disabled="!canMoveDown"
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
</template>

<style scoped>
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
