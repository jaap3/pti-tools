<script setup lang="ts">
  import type { Ref, ComputedRef } from "vue"
  import { storeToRefs } from "pinia"

  import { ref, computed } from "vue"
  import { displayDuration } from "@/audio-tools/numberformat"
  import { createBeatSlicedPtiFromSamples } from "@/pti-file-format"
  import { useSlices } from "@/stores/slices"

  const slicesStore = useSlices()
  const { slices, totalSlices, totalDuration, durationExceeded } =
    storeToRefs(slicesStore)

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

  async function handleDownload() {
    const audio = slices.value.map((slice) => slice.audio.getChannelData(0))
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
  <fieldset v-if="totalSlices > 0">
    <span
      ><label>Slices: <output :value="totalSlices" /></label
    ></span>
    <span
      ><label
        >Duration:
        <output
          :class="{ error: durationExceeded }"
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
      <label>
        <span class="downloadLabel">Download: </span>
        <button
          :disabled="!instrumentNameValid || durationExceeded"
          :title="`Download ${fileName}`"
          type="button"
          @click="handleDownload"
        >
          <span class="material-icons">download</span>
        </button>
      </label>
    </span>
  </fieldset>
</template>

<style scoped>
  fieldset {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    padding: 0;
    margin: 0 0 16px;
    padding-top: 4px;
    background: #121212;
    color: #fefefe;
    border: 0;
    align-items: center;
  }

  fieldset > span {
    display: flex;
    flex-basis: 100%;
    padding: 8px;
    align-items: center;
  }

  input:invalid {
    outline: 2px solid #731414;
  }

  output.error {
    color: #731414;
  }

  button {
    width: 40px;
    height: 34px;
    vertical-align: middle;
  }

  @media only screen and (min-width: 748px) {
    fieldset {
      justify-content: center;
    }

    fieldset > span {
      flex-basis: auto;
    }

    .downloadLabel {
      display: none;
    }

    fieldset > span:not(:last-of-type) {
      border-right: 1px solid #767677;
    }
  }
</style>
