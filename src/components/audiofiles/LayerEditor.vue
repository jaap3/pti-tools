<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"

  import AppContainer from "@/components/AppContainer.vue"
  import AudioFieldset from "@/components/audiofiles/AudioFieldset.vue"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import SampleWaveform from "@/components/audiofiles/SampleWaveform.vue"

  const slicesStore = useSlices()
  const dialog = ref<HTMLDialogElement | null>(null)

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
  }

  async function handleFileInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    const file: File | undefined = input.files?.[0]
    if (!file) return
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
  })

  onUnmounted(() => {
    const el = dialog.value
    if (!el) return
    el.removeEventListener("close", handleClose)
    document.documentElement.style.overflowY = "auto"
  })
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
          <button type="button" @click="close">
            <span class="material-icons">close</span>
          </button>

          <SamplePlayer :file="slice" />
          <SampleWaveform :file="slice" />

          <h2>Layers</h2>

          <div v-for="file in slice.layers" :key="file.id">
            <SamplePlayer :file="file" />
            <SampleWaveform :file="file" />
          </div>

          <input type="file" accept="audio/*" @input="handleFileInput" />
        </AudioFieldset>
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

  form {
    background: #0a0a0a;
    color: #fffefe;
    flex-grow: 1;
  }

  .show {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
</style>
