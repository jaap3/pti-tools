<script setup lang="ts">
  import type { Ref, ComputedRef } from "vue"
  import type { AudioFile } from "@/types"

  import { ref, computed } from "vue"
  import { createBeatSlicedPtiFromSamples } from "@/pti-file-format"

  const instrumentName: Ref<string> = ref("")
  const instrumentNameInput: Ref<HTMLInputElement | null> = ref(null)
  const instrumentNameValid: ComputedRef<boolean> = computed(
    () =>
      instrumentName.value === "" ||
      (instrumentNameInput.value?.reportValidity() ?? false),
  )
  const fileName: ComputedRef<string> = computed(() => `${instrumentName.value || "stitched"}.pti`)

  const props = defineProps<{
    files: AudioFile[]
  }>()

  async function handleDownload() {
    const audio = props.files.map((file) =>
      file.audio.getChannelData(0),
    )
    const buffer = createBeatSlicedPtiFromSamples(audio, instrumentName.value)

    const blob = new Blob([buffer], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("download", fileName.value)
    a.setAttribute("href", url)
    a.setAttribute("hidden", "")
    document.documentElement.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.documentElement.removeChild(a)
  }
</script>

<template>
  <fieldset>
    <label
      >Instrument name
      <input
        ref="instrumentNameInput"
        v-model="instrumentName"
        type="text"
        maxlength="31"
        pattern="^[\x20-\x7E]+$"
    /></label>
    <button
      :disabled="!instrumentNameValid"
      :title="`Download ${fileName}`"
      type="button"
      @click="handleDownload"
    >
        <span class="material-icons">download</span>
    </button>
  </fieldset>
</template>

<style scoped>
fieldset {
  display: flex;
  padding: 8px 0;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
}

input:invalid {
  outline: 2px solid tomato;
}

button {
  width: 40px;
  height: 34px;
  margin-left: 8px;
}
</style>
