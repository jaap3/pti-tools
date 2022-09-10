<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import TrimControl from "@/components/audiofiles/TrimControl.vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const props = defineProps<{
    slice: Slice
    canMoveUp: boolean
    canMoveDown: boolean
  }>()

  const slicesStore = useSlices()
  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)

  /**
   * Stop the playback of any audio file that has been started by this
   * component type.
   */
  function stop() {
    samplePlayer.value?.stop()
  }

  /**
   * Stops the playback of any audio file that has been started by this
   * component type and removes the slice from the list of slices.
   */
  function handleRemove() {
    stop()
    slicesStore.removeSlice(props.slice)
  }
</script>
<template>
  <AudioFieldset :name="slice.name" :duration="slice.audio.duration">
    <SamplePlayer ref="samplePlayer" :file="slice">
      <template #controls>
        <ButtonControl
          class="layers"
          :title="`Layers (${slice.layers.length})`"
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
      </template>
    </SamplePlayer>
    <ControlsHolder class="controls">
      <TrimControl :file="slice" />
    </ControlsHolder>
  </AudioFieldset>
</template>

<style scoped>
  fieldset {
    width: 300px;
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
    margin-left: auto;
    background-color: tomato;
  }
</style>
