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
  <dialog ref="dialog">
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
  </dialog>
</template>

<style scoped>
  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.8);
  }

  dialog {
    position: fixed;
    background: #0a0a0a;
    color: #fffefe;
    height: 100%;
    width: 100%;
    max-width: 960px;
    overflow: auto;
  }
</style>
