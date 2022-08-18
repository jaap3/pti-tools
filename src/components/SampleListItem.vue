<script setup lang="ts">
  import { ref } from "vue"
  import type { AudioFile } from "@/types"
  import { displayDuration } from "@/audio-tools"
  import SamplePlayer from "@/components/SamplePlayer.vue"
  import SampleWaveform from "@/components/SampleWaveform.vue"

  const props = defineProps<{
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

  function shortenString(str: string, maxLength: number) {
    const { length } = str
    if (length <= maxLength) return str
    const halfLength = Math.floor(maxLength / 2)
    return str.substring(0, halfLength) + "…" + str.substring(length - halfLength)
  }

  function displayName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, "")
  }

  function stop() {
    samplePlayer.value?.stop()
  }

  function handleRemove() {
    stop()
    emit("remove", props.file)
  }

  defineExpose({
    stop,
  })
</script>
<template>
  <fieldset :title="`${displayName(file.name)} - ${displayDuration(file.audio.duration)}`">
    <legend>
      <span class="name">{{ shortenString(displayName(file.name), 26) }}</span>
      <time :datetime="file.audio.duration.toFixed(3)">{{ displayDuration(file.audio.duration) }}</time>
    </legend>
    <SampleWaveform :file="file" />
    <div class="controls" title="">
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
      <button type="button" class="delete" @click.once="handleRemove"
        :title="`Remove ${file.name} from the list of sample`">
        <span class="material-icons">delete</span>
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
  fieldset {
    width: 300px;
    padding: 8px 0 0;
    overflow: hidden;
  }

  legend {
    display: flex;
    width: 100%;
    margin: 0 auto;
    padding: 0 4px;
    background-color: #fff;
    color: #000;
    font-weight: 400;
    max-width: 284px;
  }

  legend span {
    margin-right: auto;
    overflow: hidden;
    white-space: nowrap;
    margin-right: 4px;
  }

  legend time {
    margin-left: auto;
  }

  .controls {
    display: flex;
    margin-top: 8px;
    padding: 8px;
    justify-content: center;
    align-items: center;
    background: #121212;
  }

  ::v-deep button {
    margin: 0 8px;
    width: 40px;
    height: 40px;
    line-height: 1;
  }

  ::v-deep .play {
    margin-left: 0;
    margin-right: auto;
  }

  .delete {
    background-color: tomato;
    margin-left: auto;
    margin-right: 0;
  }
</style>
