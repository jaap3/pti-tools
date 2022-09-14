import { acceptHMRUpdate, defineStore } from "pinia"
import { computed, ref, watch } from "vue"

import {
  applyGain,
  combineAudio,
  sumChannels,
  trimSilence,
} from "@/audio-tools"

/* Types */

interface AudioFileOptions {
  trim: TrimOption
  gain: number // Gain in dB.
}

export interface AudioFile {
  id: string
  name: string
  originalAudio: AudioBuffer
  audio: AudioBuffer
  options: AudioFileOptions
}

export type Slice = AudioFile

export interface Layer extends AudioFile {
  sliceId: Slice["id"]
}

export interface ErrorMessage {
  message: string
  level: "error" | "warning"
  isError: true
}

export type TrimOption = "none" | "start" | "end" | "both"

/* Constants */

const maxSlices = 48
const maxDuration = 45 // seconds
const maxLayers = 12

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
  const ctx = new OfflineAudioContext(1, 1, 44100)
  const name = file.name
  const buffer = await file.arrayBuffer()

  let audio: AudioBuffer
  try {
    audio = await ctx.decodeAudioData(buffer)
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

  const monoAudio = await sumChannels(audio)
  return {
    id: crypto.randomUUID(),
    name: displayName(name),
    audio: monoAudio,
    originalAudio: monoAudio,
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
  let audio = originalAudio
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
  file.audio = audio
}

/* Store */

export const useSlices = defineStore("slices", () => {
  /* State */
  const slices = ref<Slice[]>([])
  const activeSliceId = ref<Slice["id"] | null>(null)
  const layers = ref<Layer[]>([])

  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })
  let source: AudioBufferSourceNode | null = null

  /* Computed */
  const totalSlices = computed(() => slices.value.length)

  const maxSlicesReached = computed(() => totalSlices.value >= maxSlices)

  const totalDuration = computed(() =>
    slices.value.reduce((sum, file) => sum + file.audio.duration, 0),
  )

  const durationExceeded = computed(() => totalDuration.value > maxDuration)

  const activeSlice = computed(() => {
    const id = activeSliceId.value
    if (id) {
      return slices.value.find((slice) => slice.id === id)
    }
    return null
  })

  const activeSliceLayers = computed(() => {
    if (!activeSliceId.value) return []
    return layers.value.filter((layer) => layer.sliceId === activeSliceId.value)
  })

  const maxLayersReached = computed(() => {
    return activeSliceLayers.value
      ? activeSliceLayers.value.length >= maxLayers
      : false
  })

  /* Watchers */
  watch(
    activeSliceLayers,
    async () => {
      if (activeSliceLayers.value.length) await handleLayerChange()
    },
    { deep: true },
  )

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
          ...audioFile,
        }
        const layer = {
          ...audioFile,
          options: { ...audioFile.options },
          id: crypto.randomUUID(),
          sliceId: slice.id,
        }
        layers.value.push(layer)
        slices.value.push(slice)
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
    const idx = slices.value.indexOf(slice)
    if (idx <= 0) return
    slices.value.splice(idx, 1)
    slices.value.splice(idx - 1, 0, slice)
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
    const idx = slices.value.indexOf(slice)
    if (idx === -1 || idx === slices.value.length - 1) return
    slices.value.splice(idx, 1)
    slices.value.splice(idx + 1, 0, slice)
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
    const idx = slices.value.indexOf(slice)
    if (idx === -1) return
    setActiveSlice(null)
    slices.value.splice(idx, 1)
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
    if (slice && !slices.value.includes(slice)) return
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
          sliceId: activeSliceId.value,
        }
        layers.value.push(layer)
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
    return layers.value.filter((layer) => layer.sliceId === slice.id).length
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
      const idx = layers.value.indexOf(layer)
      if (idx === -1) return
      layers.value.splice(idx, 1)
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
    slice.originalAudio = await combineAudio(layers.map((layer) => layer.audio))
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
    const { audio: buffer } = file
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
