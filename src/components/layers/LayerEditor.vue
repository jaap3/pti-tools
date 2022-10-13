<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed, onMounted, onUnmounted, ref, watch } from "vue"

  import AudioFieldset from "@/components/audio/AudioFieldset.vue"
  import AudioFileInput from "@/components/audio/AudioFileInput.vue"
  import EffectControls from "@/components/audio/EffectControls.vue"
  import SamplePlayer from "@/components/audio/SamplePlayer.vue"
  import AppLayout from "@/components/base/AppLayout.vue"
  import { maxLayers } from "@/lib/app/constants"
  import { useAudioContext } from "@/stores/audiocontext"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  import LayerList from "./LayerList.vue"

  const messagesStore = useMessages()
  const slicesStore = useSlices()
  const { stopPlayback } = useAudioContext()

  const container = ref<InstanceType<typeof AppLayout> | null>(null)
  const {
    activeSlice: slice,
    durationExceeded,
    maxLayersReached,
  } = storeToRefs(slicesStore)
  const fileLoaderDisabled = computed(
    () => maxLayersReached.value || durationExceeded.value,
  )

  /**
   * Stop editing the current slice's layers.
   */
  function close() {
    slicesStore.setActiveSlice(null)
  }

  /**
   * Closes the layer editor when the user presses the Escape key.
   *
   * @param evt - The keydown event.
   */
  function handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === "Escape") close()
  }

  /**
   * Attempts to load the audio file and add it to the list of layers.
   *
   * Does nothing if the input is disabled.
   *
   * @param file - The audio file to load.
   */
  async function handleFileInput(file: File) {
    if (fileLoaderDisabled.value) return
    const error = await slicesStore.addLayer(file)
    if (error) {
      const { text, level } = error
      messagesStore.addMessage(text, level, { timeout: 8500 })
    }
  }

  watch(
    maxLayersReached,
    (newValue) => {
      messagesStore.removeMessage("max-layers-reached")
      if (newValue) {
        messagesStore.addMessage(
          `Max. layers reached (${maxLayers}): Remove one or more layers to enable the file loader.`,
          "info",
          { id: "max-layers-reached" },
        )
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    // Stop any audio playback when the editor is opened.
    stopPlayback()
    addEventListener("keydown", handleKeyDown)
  })

  onUnmounted(() => {
    // Stop any audio playback when the editor is closed.
    stopPlayback()
    removeEventListener("keydown", handleKeyDown)
  })
</script>

<template>
  <AppLayout v-if="slice" ref="container">
    <template #top>
      <button type="button" class="back" @click="close">Back</button>
    </template>
    <template #main>
      <AudioFieldset
        :name="slice.name"
        :truncate-name-at="100"
        :duration="slice.duration"
        class="slice"
      >
        <SamplePlayer :audio="slice.audio" :name="slice.name" />
        <EffectControls :file="slice" />
      </AudioFieldset>
      <LayerList />
    </template>
    <template #bottom>
      <AudioFileInput :disabled="fileLoaderDisabled" @input="handleFileInput" />
    </template>
  </AppLayout>
</template>

<style scoped>
  .slice {
    flex-shrink: 0;
    margin-bottom: -12px;
  }

  .slice .controls:last-child {
    padding-bottom: 24px;
  }

  .back {
    margin-left: auto;
  }
</style>
