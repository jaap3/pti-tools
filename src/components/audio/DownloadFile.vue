<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import type { Ref } from "vue"
  import { computed, ref } from "vue"

  import { toInt16 } from "@/helpers/audio"
  import { displayDuration } from "@/helpers/numberformat"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()
  const { totalSlices, totalDuration, durationExceeded } =
    storeToRefs(slicesStore)

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
    () => !instrumentNameValid.value || durationExceeded.value,
  )

  /**
   * Creates a .pti or .wav file from the current slices, then triggers
   * a download prompt.
   */
  async function handleDownload() {
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
  <fieldset v-if="totalSlices > 0">
    <div>
      <label>Slices: <output :value="totalSlices" /></label>
    </div>
    <div>
      <label
        >Duration:
        <output
          :class="{ error: durationExceeded }"
          :value="displayDuration(totalDuration)"
      /></label>
    </div>
    <div>
      <label>
        <span>Instrument name: </span>
        <input
          ref="instrumentNameInput"
          v-model="instrumentName"
          type="text"
          maxlength="31"
          pattern="^[\x20-\x7E]+$"
      /></label>
      <div aria-label="File type">
        <select v-model="fileType">
          <option value="pti" title="Polyend Tracker Instrument">.pti</option>
          <option value="wav" title="Wave file (with cue points)">.wav</option>
        </select>
      </div>
      <label>
        <button
          :disabled="downloadDisabled"
          :title="`Download ${fileName}`"
          type="button"
          @click="handleDownload"
        >
          <span class="material-icons">download</span>
        </button>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0;
    padding-top: 4px;
    margin: 0 0 16px;
    color: #fefefe;
    background: #121212;
    border: 0;
  }

  fieldset > div {
    display: flex;
    flex-basis: 100%;
    align-items: flex-end;
    padding: 8px;
  }

  input {
    width: 100%;
  }

  input:invalid {
    outline: 2px solid #731414;
  }

  output.error {
    color: #731414;
  }

  button {
    height: 34px;
    vertical-align: middle;
  }

  @media only screen and (min-width: 748px) {
    fieldset {
      justify-content: center;
    }

    fieldset > div {
      flex-basis: auto;
    }

    input {
      width: auto;
    }

    fieldset > div:not(:last-of-type) {
      border-right: 1px solid #767677;
    }
  }
</style>
