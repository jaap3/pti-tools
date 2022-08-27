<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
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
    if (!dialog.value) return
    dialog.value.addEventListener("close", handleClose)
    dialog.value.showModal()
    document.documentElement.style.overflowY = "hidden"
  })

  onUnmounted(() => {
    if (!dialog.value) return
    dialog.value.removeEventListener("close", handleClose)
    document.documentElement.style.overflowY = "auto"
  })
</script>

<template>
  <dialog
    ref="dialog"
    @click="
      (evt) => {
        if (evt.target === dialog) close()
      }
    "
  >
    <div class="inner">
      <fieldset>
        <legend>{{ slice.name }}</legend>
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

        <input type="file" accept="audio/*" @input="handleFileInput" />
      </fieldset>
    </div>
  </dialog>
</template>

<style scoped>
  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.8);
  }

  dialog {
    position: fixed;
    background: transparent;
    height: 100%;
    width: 100%;
    margin: 0;
    border: 0;
    padding: 0;
  }

  .inner {
    background: #0a0a0a;
    color: #fffefe;
    max-width: 960px;
    margin: 0 auto;
    height: 100%;
    overflow: auto;
  }
</style>
