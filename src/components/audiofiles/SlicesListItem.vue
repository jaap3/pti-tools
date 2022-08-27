<script setup lang="ts">
  import { ref, watch } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import SampleWaveform from "@/components/audiofiles/SampleWaveform.vue"

  const props = defineProps<{
    slice: Slice
    canMoveUp: boolean
    canMoveDown: boolean
  }>()

  const slicesStore = useSlices()
  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)
  const trim = ref(false)

  function displayName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "")
  }

  function stop() {
    samplePlayer.value?.stop()
  }

  function togglePlayback() {
    const { value: player } = samplePlayer
    if (!player) return
    const { isPlaying, play, stop } = player
    isPlaying ? stop() : play()
  }

  function handleRemove() {
    stop()
    slicesStore.removeSlice(props.slice)
  }

  watch(trim, (newValue) => {
    slicesStore.trimAudio(props.slice, newValue ? "both" : "none")
  })
</script>
<template>
  <AudioFieldset
    :name="displayName(slice.name)"
    :duration="slice.audio.duration"
  >
    <SampleWaveform :file="slice" @click="togglePlayback" />
    <div class="controls" title="">
      <SamplePlayer ref="samplePlayer" :file="slice" class="play" />
      <button
        type="button"
        class="layers"
        title="Layers"
        @click="slicesStore.setEditSlice(slice)"
      >
        <span class="material-icons">layers</span>
      </button>
      <button
        type="button"
        :disabled="!canMoveUp"
        :title="`Move ${slice.name} up one position`"
        @click="slicesStore.moveSliceUp(slice)"
      >
        <span class="material-icons">arrow_back</span>
      </button>
      <button
        type="button"
        :disabled="!canMoveDown"
        :title="`Move ${slice.name} down one position`"
        @click="slicesStore.moveSliceDown(slice)"
      >
        <span class="material-icons">arrow_forward</span>
      </button>
      <button
        type="button"
        class="delete"
        :title="`Remove ${slice.name} from the list of slices`"
        @click.once="handleRemove"
      >
        <span class="material-icons">delete</span>
      </button>
    </div>
    <div class="controls">
      <label>Trim silence: <input v-model="trim" type="checkbox" /></label>
    </div>
  </AudioFieldset>
</template>

<style scoped>
  fieldset {
    width: 300px;
  }
  .controls {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    background: #121212;
  }

  :deep(button) {
    margin: 0 8px;
    width: 40px;
    height: 40px;
    line-height: 1;
    user-select: none;
  }

  :deep(.play) {
    margin-left: 0;
  }

  .layers {
    margin-right: auto;
  }

  .delete {
    background-color: tomato;
    margin-left: auto;
    margin-right: 0;
  }
</style>
