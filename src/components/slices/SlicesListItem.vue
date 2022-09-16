<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import EffectControls from "@/components/audiofiles/EffectControls.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import type { Slice } from "@/lib/app/types"
  import { useSlices } from "@/stores/slices"

  const props = defineProps<{
    slice: Slice
    canMoveUp: boolean
    canMoveDown: boolean
  }>()

  const slicesStore = useSlices()
  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)

  /**
   * Stops the playback this slice and removes it from the list of slices.
   */
  function handleRemove() {
    samplePlayer.value?.stop()
    slicesStore.removeSlice(props.slice)
  }
</script>
<template>
  <AudioFieldset :name="slice.name" :duration="slice.duration">
    <SamplePlayer ref="samplePlayer" :file="slice">
      <template #controls>
        <ButtonControl
          class="layers"
          :title="`Layers (${slicesStore.getLayerCount(slice)})`"
          icon="layers"
          @click="slicesStore.setActiveSlice(slice)"
        />
        <ButtonControl
          :disabled="!canMoveUp"
          :title="`Move \&quot;${slice.name}\&quot; up one position`"
          icon="arrow_back"
          class="move-up"
          @click="slicesStore.moveSliceUp(slice)"
        />
        <ButtonControl
          :disabled="!canMoveDown"
          :title="`Move \&quot;${slice.name}\&quot; down one position`"
          icon="arrow_forward"
          class="move-down"
          @click="slicesStore.moveSliceDown(slice)"
        />
        <ButtonControl
          class="delete"
          :title="`Remove &quot;${slice.name}&quot; from the list of slices`"
          icon="delete"
          @click.once="handleRemove"
        />
      </template>
    </SamplePlayer>
    <EffectControls :file="slice" />
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
