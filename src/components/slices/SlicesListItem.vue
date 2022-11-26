<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audio/AudioFieldset.vue"
  import ButtonControl from "@/components/audio/ButtonControl.vue"
  import EffectControls from "@/components/audio/EffectControls.vue"
  import SamplePlayer from "@/components/audio/SamplePlayer.vue"
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
  <AudioFieldset :name="slice.name" :duration="slice.duration" tabindex="0">
    <SamplePlayer ref="samplePlayer" :audio="slice.audio" :name="slice.name">
      <template #controls>
        <ButtonControl
          :title="`Layers (${slicesStore.getLayerCount(slice)})`"
          icon="layers"
          @click.stop="slicesStore.setActiveSlice(slice)"
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

  .controls .move-up {
    margin-left: auto;
  }

  .controls .move-down {
    margin-right: auto;
  }

  .controls .delete {
    background-color: tomato;
  }
</style>
