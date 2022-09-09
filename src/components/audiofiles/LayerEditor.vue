<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from "vue"

  import AppContainer from "@/components/AppContainer.vue"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import TrimControl from "@/components/audiofiles/TrimControl.vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()
  const { maxLayers, maxDuration } = slicesStore
  const dialog = ref<HTMLDialogElement | null>(null)
  const visible = ref(false)
  const fileLoaderDisabled = ref(false)

  const props = defineProps<{
    slice: Slice
  }>()

  function close() {
    dialog.value?.close()
  }

  function handleClickOutside(evt: Event) {
    if (evt.target === dialog.value?.firstElementChild) close()
  }

  function handleClose() {
    slicesStore.editSlice = null
    document.documentElement.style.overflowY = "auto"
  }

  async function handleFileInput(file: File) {
    if (fileLoaderDisabled.value) return
    await slicesStore.addLayer(props.slice, file)
    fileLoaderDisabled.value =
      props.slice.layers.length >= maxLayers ||
      props.slice.audio.duration >= maxDuration
  }

  onMounted(() => {
    const el = dialog.value
    if (!el) return
    el.tabIndex = -1
    el.focus()
    el.addEventListener("close", handleClose)
    el.showModal()
    el.classList.add("show")
    document.documentElement.style.overflowY = "hidden"
    setTimeout(() => (visible.value = true))
  })

  onUnmounted(() => {
    const el = dialog.value
    if (!el) return
    el.removeEventListener("close", handleClose)
  })

  // TODO: Stop sample playback layer is removed or dialog is closed
</script>

<template>
  <dialog ref="dialog">
    <AppContainer
      tag="div"
      :show-appreciation="true"
      @click="handleClickOutside"
    >
      <form @submit.prevent>
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
          <ControlsHolder>
            <TrimControl :file="slice" />
          </ControlsHolder>
        </AudioFieldset>
        <fieldset class="layers">
          <legend>Layers</legend>
          <ol>
            <li v-for="file in slice.layers" :key="file.id">
              <AudioFieldset :name="file.name" :duration="file.audio.duration">
                <SamplePlayer v-if="visible" :file="file">
                  <template #controls>
                    <ButtonControl
                      :disabled="slice.layers.length <= 1"
                      title="Remove"
                      icon="delete"
                      class="delete"
                      @click="slicesStore.removeLayer(slice, file)"
                    />
                  </template>
                </SamplePlayer>
                <ControlsHolder>
                  <TrimControl :file="file" />
                </ControlsHolder>
              </AudioFieldset>
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
      margin: 8px;
    }
  }

  .controls .delete {
    margin-left: auto;
  }

  .controls .delete:not(:disabled) {
    background-color: tomato;
  }

  .back {
    padding-bottom: 24px;
  }

  .back button {
    margin-left: auto;
  }
</style>
