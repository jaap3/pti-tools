<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import EffectControls from "@/components/audiofiles/EffectControls.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
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
   * Stop the playback of this layer and removes it from its slice.
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
  <AudioFieldset :name="layer.name" :duration="layer.duration">
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
    <EffectControls :file="layer" />
  </AudioFieldset>
</template>

<style scoped>
  fieldset {
    width: 300px;
  }

  .controls .delete {
    margin-left: auto;
  }

  .controls .delete:not(:disabled) {
    background-color: tomato;
  }
</style>
