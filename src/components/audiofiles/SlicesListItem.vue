<script setup lang="ts">
  import { ref, watch } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
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
      <SamplePlayer ref="samplePlayer" :file="slice" />
      <ButtonControl
        class="layers"
        title="Layers"
        icon="layers"
        @click="slicesStore.setEditSlice(slice)"
      />
      <ButtonControl
        :disabled="!canMoveUp"
        :title="`Move ${slice.name} up one position`"
        icon="arrow_back"
        class="move-up"
        @click="slicesStore.moveSliceUp(slice)"
      />
      <ButtonControl
        :disabled="!canMoveDown"
        :title="`Move ${slice.name} down one position`"
        icon="arrow_forward"
        class="move-down"
        @click="slicesStore.moveSliceDown(slice)"
      />
      <ButtonControl
        class="delete"
        :title="`Remove ${slice.name} from the list of slices`"
        icon="delete"
        @click.once="handleRemove"
      />
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
    align-items: center;
    background: #121212;
  }

  .controls :deep(button) {
    margin: 0 8px;
  }

  .controls :first-child {
    margin-left: 0;
  }

  .controls :last-child {
    margin-right: 0;
  }

  .controls .layers {
    margin-right: auto;
  }

  .controls .move-up {
    margin-right: 4px;
  }

  .controls .move-down {
    margin-left: 4px;
  }

  .controls .delete {
    background-color: tomato;
    margin-left: auto;
  }
</style>
