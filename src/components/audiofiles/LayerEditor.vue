<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed, onMounted, onUnmounted, ref, watch } from "vue"

  import AppContainer from "@/components/AppContainer.vue"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import EffectControls from "@/components/audiofiles/EffectControls.vue"
  import LayerListItem from "@/components/audiofiles/LayerListItem.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const messagesStore = useMessages()
  const slicesStore = useSlices()
  const dialog = ref<HTMLDialogElement | null>(null)
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
   * Closes the dialog.
   */
  function close() {
    dialog.value?.close()
  }

  /**
   * Closes the dialog when the user clicks outside of it.
   *
   * @param evt - The click event.
   */
  function handleClickOutside(evt: Event) {
    if (evt.target === dialog.value?.firstElementChild) close()
  }

  /**
   * Handles the closing of the dialog.
   *
   *  - Cancels the edit of the slice.
   *  - (Re-)enables scrolling on the root element.
   */
  function handleClose() {
    slicesStore.setActiveSlice(null)
    document.documentElement.style.overflowY = "auto"
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
      messagesStore.addMessage(error.message, error.level, { timeout: 8500 })
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
    // Stop any audio playback when the dialog is opened.
    slicesStore.stopPlayback()
    const el = dialog.value
    if (!el) return
    // Focus the modal dialog.
    el.tabIndex = -1
    el.focus()
    el.showModal()
    el.addEventListener("close", handleClose)
    // Trigger CSS animation.
    el.classList.add("show")
    // Disable scrolling on the root element.
    document.documentElement.style.overflowY = "hidden"
    // Delay rendering of some of the dialog content to allow for correct
    // DOM measurements.
    setTimeout(() => (visible.value = true))
  })

  onUnmounted(() => {
    // Stop any audio playback when the dialog is closed.
    slicesStore.stopPlayback()
    const el = dialog.value
    if (!el) return
    el.removeEventListener("close", handleClose)
  })
</script>

<template>
  <dialog ref="dialog">
    <AppContainer
      tag="div"
      :show-appreciation="true"
      @click="handleClickOutside"
    >
      <form v-if="slice" @submit.prevent>
        <ControlsHolder class="back">
          <button type="button" @click="close">Back</button>
        </ControlsHolder>
        <AudioFieldset
          :name="slice.name"
          :truncate-name-at="100"
          :duration="slice.audio.duration"
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
    </AppContainer>
  </dialog>
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
