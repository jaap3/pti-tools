import { acceptHMRUpdate, defineStore } from "pinia"
import { computed, ref, watch } from "vue"

import {
  applyGain,
  combineAudio,
  createAudioBuffer,
  getOfflineAudioContext,
  sumChannels,
  trimSilence,
} from "@/audio-tools"

/* Types */

export interface ErrorMessage {
  message: string
  level: "error" | "warning"
  isError: true
}

export type TrimOption = "none" | "start" | "end" | "both"

interface AudioFileOptions {
  trim: TrimOption
  gain: number // Gain in dB.
}

export interface AudioFile {
  name: string
  originalAudio: Float32Array
  audio: Float32Array
  duration: number
  options: AudioFileOptions
}

export interface Slice extends AudioFile {
  id: string
}

export interface Layer extends AudioFile {
  id: string
  sliceId: Slice["id"]
}

/* Constants */

const maxSlices = 48 // The Tracker can handle up to 48 slices (it has 48 pads).

// The recommended upper limit for an AudioBuffer is 45s.
// > Objects of these types are designed to hold small audio snippets, typically
// > less than 45 s
// > https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
// On the Tracker, according to the documentation
// > The longest recorded audio file can be 30 seconds long max.
// and:
// > The per-project memory is 133 seconds of mono samples.
// So 45s seems like a reasonable upper limit, as it *might* be possible to
// load a 45s sample into the Tracker. I have not tried this.
const maxDuration = 45

// There's no real reason to limit the number of layers. Twelve seems to
// work well, though.
const maxLayers = 12

const offlineCtx = getOfflineAudioContext()

/* Utilities */

/**
 * Creates an error message object.
 *
 * @param message - The error message.
 * @param level - The error level.
 * @returns The error message object.
 */
function errorMessage(
  message: string,
  level: "error" | "warning" = "error",
): ErrorMessage {
  return {
    message,
    level,
    isError: true,
  }
}

/**
 * Strips the extension from a filename.
 *
 * @param fileName - The filename.
 * @returns The filename without the extension.
 */
function displayName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "")
}

/**
 * Attempts to load an audio file.
 *
 * @param file - A File object.
 * @returns A promise that resolves to an object containing the audio buffer,
 *     file name and other metadata. This data can then be augmented to
 *     become a slice or layer. If the operation fails, the promise resolves
 *     to an object with a message that can be displayed to the user.
 */
async function loadAudio(file: File): Promise<AudioFile | ErrorMessage> {
  const name = file.name
  const buffer = await file.arrayBuffer()

  let audio: AudioBuffer
  try {
    audio = await offlineCtx.decodeAudioData(buffer)
  } catch (e) {
    return errorMessage(
      `Could not load "${name}", invalid audio file.`,
      "error",
    )
  }
  if (audio.duration > maxDuration) {
    return errorMessage(
      `Rejected "${name}", too long (>${maxDuration}s).`,
      "warning",
    )
  }

  const monoAudio = (await sumChannels(audio)).getChannelData(0)
  return {
    name: displayName(name),
    audio: monoAudio,
    originalAudio: monoAudio,
    duration: audio.duration,
    options: {
      trim: "none",
      gain: 0,
    },
  }
}

/**
 * Applies the audio file options.
 *
 * @param file - A AudioFile object.
 */
async function applyEffects(file: AudioFile | Slice | Layer) {
  const { originalAudio, options: audioOptions } = file
  let audio = createAudioBuffer(originalAudio, offlineCtx)
  switch (audioOptions.trim) {
    case "start":
      audio = trimSilence(audio, true, false)
      break
    case "end":
      audio = trimSilence(audio, false, true)
      break
    case "both":
      audio = trimSilence(audio)
      break
  }
  audio = await applyGain(audio, audioOptions.gain)
  file.audio = audio.getChannelData(0)
  file.duration = audio.duration
}

/* Store */

export const useSlices = defineStore("slices", () => {
  /* State */
  const slices = ref<Record<Slice["id"], Slice>>({})
  const sliceIdList = ref<Slice["id"][]>([])
  const activeSliceId = ref<Slice["id"] | null>(null)
  const layers = ref<Record<Layer["id"], Layer>>({})

  /* Lookups */

  /**
   * Returns the layers of the slice with the given ID.
   *
   * @param sliceId - The slice ID.
   * @returns The layers of the slice.
   */
  function getLayers(sliceId: Slice["id"]) {
    return Object.values(layers.value).filter(
      (layer) => layer.sliceId === sliceId,
    )
  }

  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })
  let source: AudioBufferSourceNode | null = null

  /* Computed */
  const slicesList = computed({
    get() {
      return sliceIdList.value
        .map((id) => slices.value[id] ?? null)
        .filter(Boolean) as Slice[]
    },
    set(value) {
      // Make sure all given slices are in the store, then update the id list.
      sliceIdList.value = value
        .filter((slice) => Boolean(slices.value[slice.id]))
        .map((slice) => slice.id)
      // Reap any slices that are no longer in the list.
      Object.keys(slices.value).forEach((id) => {
        if (!sliceIdList.value.includes(id)) {
          delete slices.value[id]
        }
      })
    },
  })

  const totalSlices = computed(() => sliceIdList.value.length)

  const maxSlicesReached = computed(() => totalSlices.value >= maxSlices)

  const totalDuration = computed(() =>
    Object.values(slices.value).reduce((sum, file) => sum + file.duration, 0),
  )

  const durationExceeded = computed(() => totalDuration.value > maxDuration)

  const activeSlice = computed(() => {
    const sliceId = activeSliceId.value
    return sliceId === null ? null : slices.value[sliceId]
  })

  const activeSliceLayers = computed(() => {
    if (!activeSliceId.value) return []
    return getLayers(activeSliceId.value)
  })

  const maxLayersReached = computed(() => {
    return activeSliceLayers.value
      ? activeSliceLayers.value.length >= maxLayers
      : false
  })

  /* Watchers */
  watch(activeSliceLayers, handleLayerChange, { deep: true })

  /* Actions */

  /**
   * Attempts to load an audio file and add it to the store.
   *
   * @param file - A File object.
   * @returns A promise containing an object with a message to display
   *     to the user if the operation failed, nothing otherwise.
   */
  async function addSlice(file: File): Promise<ErrorMessage | void> {
    const name = file.name

    if (maxSlicesReached.value) {
      return errorMessage(
        `Rejected "${name}", max. ${maxSlices} slices reached.`,
        "warning",
      )
    } else if (durationExceeded.value) {
      return errorMessage(
        `Rejected "${name}", total duration > ${maxDuration}.`,
        "warning",
      )
    } else {
      const audioFileOrError = await loadAudio(file)
      if ("isError" in audioFileOrError && audioFileOrError.isError) {
        return audioFileOrError
      } else if ("audio" in audioFileOrError) {
        const audioFile = audioFileOrError
        const slice = {
          id: crypto.randomUUID(),
          ...audioFile,
        }
        const layer = {
          ...audioFile,
          options: { ...audioFile.options },
          id: crypto.randomUUID(),
          sliceId: slice.id,
        }
        layers.value[layer.id] = layer
        slices.value[slice.id] = slice
        sliceIdList.value.push(slice.id)
      }
    }
  }

  /**
   * Moves the slice up one position in the list of slices.
   *
   * Does nothing if the slice is already at the top, or if it is not in the
   * list of slices.
   *
   * @param slice - The slice to move.
   */
  function moveSliceUp(slice: Slice) {
    const idx = sliceIdList.value.indexOf(slice.id)
    if (idx <= 0) return
    sliceIdList.value.splice(idx, 1)
    sliceIdList.value.splice(idx - 1, 0, slice.id)
  }

  /**
   * Moves the slice down one position in the list of slices.
   *
   * Does nothing if the slice is already at the bottom, or if it is not in the
   * list of slices.
   *
   * @param slice - The slice to move.
   */
  function moveSliceDown(slice: Slice) {
    const idx = sliceIdList.value.indexOf(slice.id)
    if (idx === -1 || idx === sliceIdList.value.length - 1) return
    sliceIdList.value.splice(idx, 1)
    sliceIdList.value.splice(idx + 1, 0, slice.id)
  }

  /**
   * Removes a slice from the store. If the slice is currently being edited,
   * the edit is cancelled.
   *
   * Does nothing if the slice is not in the list of slices.
   *
   * @param slice - The slice to remove.
   */
  function removeSlice(slice: Slice) {
    if (sliceIdList.value.includes(slice.id)) {
      setActiveSlice(null)
      sliceIdList.value = sliceIdList.value.filter((id) => id !== slice.id)
      delete slices.value[slice.id]
    }
  }

  /**
   * Sets the slice that is currently being edited. Pass `null` to cancel the
   * current edit.
   *
   * Does nothing if the slice is not in the list of slices.
   *
   * @param slice - The slice to edit (or `null` to cancel the edit).
   */
  function setActiveSlice(slice: Slice | null) {
    if (slice && !sliceIdList.value.includes(slice.id)) return
    activeSliceId.value = slice?.id ?? null
  }

  /**
   * Attempts to load an audio file and add it to the slice that is currently
   * being edited as a new layer.
   *
   * Does nothing if there is no slice being edited, or if the maximum number
   * of layers for that slice has been reached.
   *
   * @param file - A File object.
   * @returns A promise containing an object with a message to display
   *     to the user if the operation failed, nothing otherwise.
   */
  async function addLayer(file: File): Promise<ErrorMessage | void> {
    if (!activeSliceId.value) return
    const name = file.name
    if (maxLayersReached.value) {
      return errorMessage(
        `Rejected "${name}", max. layers reached (${maxLayers}).`,
        "warning",
      )
    } else {
      const audioFileOrError = await loadAudio(file)
      if ("isError" in audioFileOrError && audioFileOrError.isError) {
        return audioFileOrError
      } else if ("audio" in audioFileOrError) {
        const audioFile = audioFileOrError
        const layer = {
          ...audioFile,
          id: crypto.randomUUID(),
          sliceId: activeSliceId.value,
        }
        layers.value[layer.id] = layer
      }
    }
  }

  /**
   * Get the number of layers for a given slice.
   *
   * @param slice - Slice to get the layer count for.
   * @returns The number of layers for the slice.
   */
  function getLayerCount(slice: Slice): number {
    return getLayers(slice.id).length
  }

  /**
   * Removes a layer from the slice that is currently being edited.
   * Does nothing if the slice has only one layer, or if the given
   * layer is not in the slice.
   *
   * @param layer - The layer to remove.
   * @returns A promise containing an object with a message to display
   *     to the user if the operation failed, nothing otherwise.
   */
  async function removeLayer(layer: Layer): Promise<ErrorMessage | void> {
    if (!activeSliceId.value) return
    if (layer.sliceId !== activeSliceId.value) return
    if (activeSliceLayers.value.length <= 1) {
      return errorMessage(
        "Cannot remove layer, a slice must have at least one layer.",
        "warning",
      )
    } else {
      delete layers.value[layer.id]
    }
  }

  /**
   * Replaces the slice's audio with the combined audio of all its layers.
   * Updates the slice's name to reflect the names of its layers.
   */
  async function handleLayerChange() {
    const slice = activeSlice.value
    const layers = activeSliceLayers.value
    if (!slice || !layers.length) return
    const buffers = layers.map((layer) =>
      createAudioBuffer(layer.audio, offlineCtx),
    )
    slice.originalAudio = (await combineAudio(buffers)).getChannelData(0)
    await applyEffects(slice)
    slice.name = layers.map((layer) => layer.name).join(" + ")
  }

  /**
   * Trims the file's audio according to the given trim option.
   * Updates the file's trim option to reflect the requested trim.
   *
   * If the given file is a layer, the slice's audio is also updated.
   *
   * @param file - The file to trim.
   * @param option - The trim option to apply.
   */
  async function trimAudio(
    file: AudioFile | Slice | Layer,
    option: TrimOption,
  ) {
    if (ctx === undefined) return
    file.options.trim = option
    await applyEffects(file)
  }

  /**
   * Sets the gain of the file's audio.
   *
   * @param file - The file to update.
   * @param gain - The gain to apply.
   */
  async function setGain(file: AudioFile | Slice | Layer, gain: number) {
    file.options.gain = Math.min(Math.max(gain, -24), 24)
    await applyEffects(file)
  }

  /**
   * Creates a new AudioBufferSourceNode from the given audio file.
   * Any previous AudioBufferSourceNode created by this function
   * is disconnected and disposed.
   *
   * @param file - The audio file to create the node from.
   * @returns The new AudioBufferSourceNode.
   */
  function getAudioBufferSourceNode(file: AudioFile): AudioBufferSourceNode {
    stopPlayback()
    const { audio } = file
    const buffer = createAudioBuffer(audio, ctx)
    source = new AudioBufferSourceNode(ctx, { buffer })
    return source
  }

  /**
   * Stops the playback of the AudioBufferSourceNode most recently created
   * by getAudioBufferSourceNode (if any).
   */
  function stopPlayback() {
    source?.stop()
    source?.disconnect()
    source = null
  }

  return {
    // Constants
    maxSlices,
    maxDuration,
    maxLayers,
    // State
    slices,
    activeSliceId,
    activeSlice,
    audioContext: ctx,
    // Computed
    slicesList,
    totalSlices,
    maxSlicesReached,
    totalDuration,
    durationExceeded,
    activeSliceLayers,
    maxLayersReached,
    // Actions
    addSlice,
    moveSliceUp,
    moveSliceDown,
    removeSlice,
    setActiveSlice,
    addLayer,
    getLayerCount,
    removeLayer,
    trimAudio,
    setGain,
    getAudioBufferSourceNode,
    stopPlayback,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSlices, import.meta.hot))
}
