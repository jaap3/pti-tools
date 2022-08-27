<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue"
  import type { Slice } from "@/stores/slices"
  import { useSlices } from "@/stores/slices"
  import SamplePlayer from "@/components/audiofiles/SamplePlayer.vue"
  import SampleWaveform from "@/components/audiofiles/SampleWaveform.vue"

  const slicesStore = useSlices()
  const dialog = ref<HTMLDialogElement | null>(null)

  defineProps<{
    slice: Slice
  }>()

  function close() {
    dialog.value?.close()
  }

  function handleClose() {
    slicesStore.editSlice = null
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
    <div class="sample-player">
      <SamplePlayer :file="slice" />
    </div>
    <div class="sample-waveform">
      <SampleWaveform :file="slice" />
    </div>
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
