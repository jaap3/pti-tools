<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import TrimControl from "@/components/audiofiles/TrimControl.vue"
  import { useMessages } from "@/stores/messages"
  import type { Layer } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const messagesStore = useMessages()
  const slicesStore = useSlices()
  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)

  defineProps<{
    layer: Layer
    canDelete: boolean
  }>()

  /**
   * Removes a layer from its slice.
   *
   * @param layer - The layer to remove.
   */
  async function handleDelete(layer: Layer) {
    samplePlayer.value?.stop()
    const error = await slicesStore.removeLayer(layer)
    if (error) {
      messagesStore.addMessage(error.message, error.level, { timeout: 8500 })
    }
  }
</script>

<template>
  <AudioFieldset :name="layer.name" :duration="layer.audio.duration">
    <SamplePlayer ref="samplePlayer" :file="layer">
      <template #controls>
        <ButtonControl
          :disabled="!canDelete"
          title="Remove"
          icon="delete"
          class="delete"
          @click="handleDelete(layer)"
        />
      </template>
    </SamplePlayer>
    <ControlsHolder>
      <TrimControl :file="layer" />
    </ControlsHolder>
  </AudioFieldset>
</template>

<style scoped>
  .controls .delete {
    margin-left: auto;
  }

  .controls .delete:not(:disabled) {
    background-color: tomato;
  }
</style>
