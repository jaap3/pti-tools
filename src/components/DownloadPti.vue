<script setup lang="ts">
  import type { Ref, ComputedRef } from "vue"
  import type { AudioFile } from "@/types"

  import { ref, computed } from "vue"
  import { displayDuration } from "@/audio-tools"
  import { createBeatSlicedPtiFromSamples } from "@/pti-file-format"

  const instrumentName: Ref<string> = ref("")
  const instrumentNameInput: Ref<HTMLInputElement | null> = ref(null)
  const instrumentNameValid: ComputedRef<boolean> = computed(
    () =>
      instrumentName.value === "" ||
      (instrumentNameInput.value?.reportValidity() ?? false),
  )
  const fileName: ComputedRef<string> = computed(
    () => `${instrumentName.value || "stitched"}.pti`,
  )
  const totalDuration: ComputedRef<number> = computed(() =>
    props.files.reduce((sum, file) => sum + file.audio.duration, 0),
  )
  const totalSlices: ComputedRef<number> = computed(() => props.files.length)

  const props = defineProps<{
    files: AudioFile[]
  }>()

  async function handleDownload() {
    const audio = props.files.map((file) => file.audio.getChannelData(0))
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
    <span
      ><label>Slices: <output :value="totalSlices" /></label
    ></span>
    <span
      ><label
        >Duration:
        <output
          :class="{ error: totalDuration > 45 }"
          :value="displayDuration(totalDuration)" /></label
    ></span>
    <span>
      <label
        >Instrument name:
        <input
          ref="instrumentNameInput"
          v-model="instrumentName"
          type="text"
          maxlength="31"
          pattern="^[\x20-\x7E]+$"
      /></label>
    </span>
    <span>
      <button
        :disabled="!instrumentNameValid || totalDuration > 45"
        :title="`Download ${fileName}`"
        type="button"
        @click="handleDownload"
      >
        <span class="material-icons">download</span>
      </button>
    </span>
  </fieldset>
</template>

<style scoped>
  fieldset {
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    margin: 16px 0;
    padding-top: 4px;
    background: #121212;
    color: #fefefe;
    border: 0;
    align-items: stretch;
    height: 48px;
  }

  input:invalid {
    outline: 2px solid #731414;
  }

  fieldset > span:not(:last-of-type) {
    border-right: 1px solid #767677;
  }

  fieldset > span {
    display: flex;
    padding: 8px;
    align-items: center;
  }

  output.error {
    color: #731414;
  }

  button {
    width: 40px;
    height: 34px;
  }
</style>
