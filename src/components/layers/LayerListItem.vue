<script setup lang="ts">
  import { ref } from "vue"

  import AudioFieldset from "@/components/audio/AudioFieldset.vue"
  import ButtonControl from "@/components/audio/ButtonControl.vue"
  import EffectControls from "@/components/audio/EffectControls.vue"
  import SamplePlayer from "@/components/audio/SamplePlayer.vue"
  import type { Layer } from "@/lib/app/types"
  import { useMessages } from "@/stores/messages"
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
      const { text, level } = error
      messagesStore.addMessage(text, level, { timeout: 8500 })
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
