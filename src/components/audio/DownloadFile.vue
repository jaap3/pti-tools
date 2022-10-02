<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import type { Ref } from "vue"
  import { computed, ref } from "vue"

  import { useSlices } from "@/stores/slices"

  import ButtonControl from "./ButtonControl.vue"

  const slicesStore = useSlices()
  const { totalSlices, durationExceeded } = storeToRefs(slicesStore)

  const instrumentName = ref("")
  const instrumentNameInput: Ref<HTMLInputElement | null> = ref(null)
  const instrumentNameValid = computed(
    () =>
      instrumentName.value === "" ||
      (instrumentNameInput.value?.reportValidity() ?? false),
  )
  const fileType = ref("pti")
  const fileName = computed(
    () => `${instrumentName.value || "stitched"}.${fileType.value}`,
  )
  const downloadDisabled = computed(
    () =>
      totalSlices.value < 1 ||
      !instrumentNameValid.value ||
      durationExceeded.value,
  )

  /**
   * Creates a .pti or .wav file from the current slices, then triggers
   * a download prompt.
   */
  async function handleDownload() {
    const { toInt16 } = await import("@/helpers/audio")
    const audio = toInt16(await slicesStore.renderSlices())

    let buffer: ArrayBufferLike

    if (fileType.value === "pti") {
      const { createBeatSlicedPti } = await import("@/helpers/ptifile")
      buffer = createBeatSlicedPti(
        audio,
        slicesStore.slicesList,
        instrumentName.value,
      )
    } else {
      const { createWaveFileWithCuePoints } = await import("@/helpers/wavfile")
      buffer = createWaveFileWithCuePoints(audio, slicesStore.slicesList)
    }

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
  <div class="toolbar">
    <label>
      Name:
      <input
        ref="instrumentNameInput"
        v-model="instrumentName"
        type="text"
        maxlength="31"
        pattern="^[\x20-\x7E]+$"
      />
    </label>
    <label aria-label="File type">
      <select v-model="fileType">
        <option value="pti" title="Polyend Tracker Instrument">.pti</option>
        <option value="wav" title="Wave file (with cue points)">.wav</option>
      </select>
    </label>
    <label aria-label="Download">
      <ButtonControl
        icon="download"
        :disabled="downloadDisabled"
        :title="`Download ${fileName}`"
        @click="handleDownload"
      />
    </label>
  </div>
</template>

<style scoped>
  .toolbar {
    display: flex;
  }

  input {
    width: auto;
  }

  input:invalid {
    outline: 2px solid var(--medium-dark-red);
  }

  button {
    height: 34px;
    vertical-align: middle;
  }
</style>
