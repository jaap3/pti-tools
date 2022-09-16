<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed, onMounted, onUnmounted, ref, watch } from "vue"

  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import EffectControls from "@/components/audiofiles/EffectControls.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  import LayerListItem from "./LayerListItem.vue"

  const messagesStore = useMessages()
  const slicesStore = useSlices()
  const container = ref<HTMLElement | null>(null)
  const visible = ref(false)
  const { maxLayers } = slicesStore
  const {
    activeSlice: slice,
    activeSliceLayers: layers,
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
   * Closes the dialog when the user clicks outside of it.
   *
   * @param evt - The click event.
   */
  function handleClickOutside(evt: Event) {
    if (
      evt.target instanceof Node &&
      container.value &&
      !container.value.contains(evt.target)
    ) {
      close()
    }
  }
  /**
   * Attempts to load the audio file and add it to the list of layers.
   *
   * Does nothing if the input is disabled.
   *
   * @param file - The audio file to load.
   */
  async function handleFileInput(file: File) {
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
    slicesStore.stopPlayback()
    addEventListener("keydown", handleKeyDown)
    // Attach the click handler after a short delay to avoid closing the editor
    // immediately after opening it.
    setTimeout(() => addEventListener("click", handleClickOutside))
  })

  onUnmounted(() => {
    // Stop any audio playback when the editor is closed.
    slicesStore.stopPlayback()
    removeEventListener("keydown", handleKeyDown)
    removeEventListener("click", handleClickOutside)
  })
</script>

<template>
  <form v-if="slice" ref="container" @submit.prevent>
    <ControlsHolder class="back">
      <button type="button" @click="close">Back</button>
    </ControlsHolder>
    <AudioFieldset
      :name="slice.name"
      :truncate-name-at="100"
      :duration="slice.duration"
      class="slice"
    >
      <SamplePlayer v-if="visible" :file="slice" />
      <EffectControls :file="slice" />
    </AudioFieldset>
    <fieldset class="layers">
      <legend>Layers</legend>
      <ol>
        <li v-for="layer in layers" :key="layer.id">
          <LayerListItem :layer="layer" :can-delete="layers.length > 1" />
        </li>
      </ol>

      <AudioFileInput
        :disabled="fileLoaderDisabled"
        class="file-input"
        @input="handleFileInput"
      />
    </fieldset>
  </form>
</template>

<style scoped>
  dialog::backdrop {
    background-color: rgb(0 0 0 / 75%);
  }

  dialog {
    position: fixed;
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    border: 0;
    opacity: 0;
    transition: all 0.3s ease-in;
    transform: scale(0.5) translateY(100%);
  }

  .show {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  form {
    flex-grow: 1;
    color: #fffefe;
    background: #0a0a0a;
  }

  form,
  .slice,
  .layers,
  ol {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
  }

  .slice {
    flex-basis: fit-content;
    flex-grow: 0;
    margin: -12px 0 0;
  }

  .slice .controls:last-of-type {
    padding-bottom: 24px;
  }

  .layers {
    padding: 8px 0;
    margin: -12px 0 0;
  }

  .layers legend {
    display: flex;
    width: 100%;
    max-width: calc(100% - 16px);
    padding: 0 4px;
    margin: 0 auto;
    font-weight: 400;
    color: #000;
    background-color: #fff;
  }

  .file-input {
    width: calc(100% - 32px);
    margin: 16px;
  }

  ol {
    flex-flow: row wrap;
    align-content: flex-start;
    width: 100%;
    max-width: 300px;
    padding: 0;
    margin: 0 auto;
    list-style: none;
  }

  li {
    margin: 8px 0;
  }

  li fieldset {
    margin: 0 -1px;
  }

  @media only screen and (min-width: 655px) {
    ol {
      max-width: 608px;
    }
  }

  @media only screen and (min-width: 976px) {
    ol {
      max-width: 960px;
    }

    li:nth-child(3n + 2) {
      margin: 8px 16px;
    }
  }

  .back {
    padding-bottom: 24px;
  }

  .back button {
    margin-left: auto;
  }
</style>