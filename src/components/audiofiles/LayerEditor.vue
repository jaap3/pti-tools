<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  import AppContainer from "@/components/AppContainer.vue"
  import AudioFileInput from "@/components/audiofiles/AudioFileInput.vue"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import ButtonControl from "@/components/audiofiles/ButtonControl.vue"
  import ControlsHolder from "@/components/audiofiles/ControlsHolder.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"

  const slicesStore = useSlices()
  const { maxLayers, maxDuration } = slicesStore
  const dialog = ref<HTMLDialogElement | null>(null)
  const visible = ref(false)

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

  const fileLoaderDisabled = computed(
    () =>
      props.slice.layers.length > maxLayers ||
      props.slice.audio.duration > maxDuration,
  )
</script>

<template>
  <dialog ref="dialog">
    <AppContainer
      tag="div"
      :show-appreciation="true"
      @click="handleClickOutside"
    >
      <form @submit.prevent>
        <AudioFieldset :name="slice.name" :duration="slice.audio.duration">
          <SamplePlayer v-if="visible" :file="slice" />

          <fieldset class="layers">
            <legend>Layers</legend>

            <AudioFileInput
              :disabled="fileLoaderDisabled"
              class="file-input"
              @input="handleFileInput"
            />

            <ol>
              <li v-for="file in slice.layers" :key="file.id">
                <AudioFieldset
                  :name="file.name"
                  :duration="file.audio.duration"
                >
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
                </AudioFieldset>
              </li>
            </ol>
          </fieldset>
        </AudioFieldset>
        <ControlsHolder>
          <button type="button" class="back" @click="close">Back</button>
        </ControlsHolder>
      </form>
    </AppContainer>
  </dialog>
</template>

<style scoped>
  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.75);
  }

  dialog {
    position: fixed;
    background: transparent;
    height: 100%;
    width: 100%;
    max-height: 100%;
    max-width: 100%;
    margin: 0;
    border: 0;
    padding: 0;
    transition: all 0.3s ease-in;
    transform: scale(0.5) translateY(100%);
    opacity: 0;
  }

  .show {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  form {
    background: #0a0a0a;
    color: #fffefe;
    flex-grow: 1;
  }

  .layers {
    margin: 8px 0;
    padding: 8px 0;
    border: 0;
    border-top: 1px solid#a0a0a0;
  }

  .layers legend {
    display: flex;
    width: 100%;
    margin: 0 auto;
    padding: 0 4px;
    background-color: #fff;
    color: #000;
    font-weight: 400;
    max-width: calc(100% - 16px);
  }

  .file-input {
    margin: 0 8px;
  }

  ol {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin: 0 auto;
    padding: 0;
    max-width: 300px;
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
      margin: 8px 8px;
    }
  }

  .controls .delete {
    margin-left: auto;
  }

  .controls .delete:not(:disabled) {
    background-color: tomato;
  }

  .back {
    margin-left: auto;
  }
</style>
