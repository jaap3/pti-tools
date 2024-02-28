import { acceptHMRUpdate, defineStore } from "pinia"
import { computed, ref, watch } from "vue"

import {
  applyGain,
  combineAudio,
  createAudioBuffer,
  getOfflineAudioContext,
  sumChannels,
  trimSilence,
} from "@/helpers/audio"
import { maxDuration, maxLayers, maxSlices } from "@/lib/app/constants"
import type {
  Audio,
  AudioFile,
  AudioFileOptions,
  EditableAudioFile,
  ErrorMessage,
  Layer,
  Slice,
  TrimOption,
} from "@/lib/app/types"

const offlineCtx = getOfflineAudioContext()

/* Utilities */

/**
 * Creates an error message object.
 * @param text - The error message.
 * @param level - The error level.
 * @returns The error message object.
 */
function errorMessage(
  text: string,
  level: "error" | "warning" = "error",
): ErrorMessage {
  return {
    text,
    level,
    isError: true,
  }
}

/**
 * Creates audio object from the given audio data.
 * @param audio - The audio data.
 * @param duration - The audio duration in seconds.
 * @returns An audio object.
 */
function getAudio(audio: Float32Array, duration: number): Audio {
  return {
    audio,
    duration,
  }
}

/**
 * Strips the extension from a filename.
 * @param fileName - The filename.
 * @returns The filename without the extension.
 */
function displayName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "")
}

/**
 * Attempts to load an audio file.
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

  const data = (await sumChannels(audio)).getChannelData(0)
  return {
    ...getAudio(data, audio.duration),
    name: displayName(name),
  }
}

/**
 * Turns an audio file object into an editable audio file.
 * @param file - An audio file, slice or layer object.
 * @param file.audio - The audio data.
 * @param file.duration - The audio duration.
 * @param file.name - The file name.
 * @param options - The audio options.
 * @returns A new editable audio file object.
 */
function createEditableAudioFile(
  { audio, duration, name }: AudioFile,
  options: AudioFileOptions = {
    trim: "none",
    gain: 0,
  },
): EditableAudioFile {
  return {
    audio,
    duration,
    name,
    id: crypto.randomUUID(),
    originalAudio: audio,
    options: { ...options },
  }
}

/**
 * Creates a slice object.
 * @param file - An audio file object.
 * @returns A new slice object.
 */
function createSlice(file: AudioFile | EditableAudioFile): Slice {
  const newSlice = {
    ...createEditableAudioFile(
      file,
      "options" in file ? file.options : undefined,
    ),
  }
  if ("originalAudio" in file) {
    // When creating a slice from an existing slice or layer, the original
    // audio data needs to be preserved in order to be able to undo/redo the
    // applied effects.
    newSlice.originalAudio = file.originalAudio
  }
  return newSlice
}

/**
 * Creates a layer object.
 * @param sliceId - The slice ID.
 * @param file - An audio file object.
 * @returns A new layer object.
 */
function createLayer(
  sliceId: Slice["id"],
  file: AudioFile | EditableAudioFile,
): Layer {
  const newLayer = {
    ...createEditableAudioFile(
      file,
      "options" in file ? file.options : undefined,
    ),
    sliceId,
  }
  if ("originalAudio" in file) {
    // When creating a layer from an existing slice or layer, the original
    // audio data needs to be preserved in order to be able to undo/redo the
    // applied effects.
    newLayer.originalAudio = file.originalAudio
  }
  return newLayer
}

/**
 * Applies audio file options to the given audio data.
 * @param data - Audio data.
 * @param options - The audio options.
 * @returns A promise that resolves to an Audio object
 *     of the processed audio data.
 */
async function applyEffects(
  data: Float32Array,
  options: AudioFileOptions,
): Promise<Audio> {
  let audio = createAudioBuffer(data, offlineCtx)
  audio = await applyGain(audio, options.gain)
  switch (options.trim) {
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
  return getAudio(audio.getChannelData(0), audio.duration)
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
   * @param sliceId - The slice ID.
   * @returns The layers of the slice.
   */
  function getLayers(sliceId: Slice["id"]) {
    return Object.values(layers.value).filter(
      (layer) => layer.sliceId === sliceId,
    )
  }

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
  watch(activeSliceLayers, handleLayerChange)

  /* Actions */

  /**
   * Renders the audio of the list of slices in sequence.
   * @returns A promise that resolves to the rendered audio buffer.
   */
  async function renderSlices(): Promise<AudioBuffer> {
    const buffers = slicesList.value.map((slice) =>
      createAudioBuffer(slice.audio, offlineCtx),
    )
    return await combineAudio(buffers, true)
  }

  /**
   * Attempts to load an audio file and add it to the store.
   * @param file - A File object.
   * @returns A promise containing an object with a message to display
   *     to the user if the operation failed, nothing otherwise.
   */
  async function addSlice(
    file: File | EditableAudioFile,
  ): Promise<ErrorMessage | void> {
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
    }

    let audioFile: AudioFile | EditableAudioFile
    if (file instanceof File) {
      // Load the audio file.
      const audioFileOrError = await loadAudio(file)
      if ("isError" in audioFileOrError) {
        return audioFileOrError
      }
      audioFile = audioFileOrError
    } else {
      // An existing slice or layer was passed.
      audioFile = file
    }

    const slice = createSlice(audioFile)
    const layer = createLayer(slice.id, audioFile)
    layers.value[layer.id] = layer
    slices.value[slice.id] = slice
    sliceIdList.value.push(slice.id)
  }

  /**
   * Duplicate an existing slice.
   * @param slice - A slice object.
   * @returns A error message object if the operation failed, nothing otherwise.
   */
  function duplicateSlice(slice: Slice): ErrorMessage | undefined {
    const name = slice.name

    if (maxSlicesReached.value) {
      return errorMessage(
        `Unable to duplicate "${name}", max. ${maxSlices} slices reached.`,
        "warning",
      )
    } else if (durationExceeded.value) {
      return errorMessage(
        `Unable to duplicate "${name}", total duration > ${maxDuration}.`,
        "warning",
      )
    }

    const newSlice = createSlice(slice)
    getLayers(slice.id).forEach((layer: Layer) => {
      const newLayer = createLayer(newSlice.id, layer)
      layers.value[newLayer.id] = newLayer
    })
    slices.value[newSlice.id] = newSlice
    sliceIdList.value.push(newSlice.id)

    return
  }

  /**
   * Moves the slice up one position in the list of slices.
   *
   * Does nothing if the slice is already at the top, or if it is not in the
   * list of slices.
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
   * @param file - A File object.
   * @returns A promise containing an object with a message to display
   *     to the user if the operation failed, nothing otherwise.
   */
  async function addLayer(
    file: File | EditableAudioFile,
  ): Promise<ErrorMessage | void> {
    if (!activeSliceId.value) return

    const name = file.name

    if (maxLayersReached.value) {
      return errorMessage(
        `Rejected "${name}", max. layers reached (${maxLayers}).`,
        "warning",
      )
    }

    let audioFile: AudioFile | EditableAudioFile

    if (file instanceof File) {
      // Load the audio file.
      const audioFileOrError = await loadAudio(file)
      if ("isError" in audioFileOrError) {
        return audioFileOrError
      }
      audioFile = audioFileOrError
    } else {
      // An existing layer or slice was passed.
      audioFile = file
    }

    const layer = createLayer(activeSliceId.value, audioFile)
    layers.value[layer.id] = layer
  }

  /**
   * Get the number of layers for a given slice.
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
   * Update the audio data of a slice or layer.
   * Does nothing if the slice or layer is not in the store.
   * @param sliceOrLayer - The slice or layer to update.
   * @param audio - The new audio data.
   */
  function updateSliceOrLayerAudio(sliceOrLayer: Slice | Layer, audio: Audio) {
    if ("sliceId" in sliceOrLayer) {
      const layer = sliceOrLayer
      if (!layers.value[layer.id]) return
      layers.value[layer.id] = { ...layer, ...audio }
    } else {
      const slice = sliceOrLayer
      if (!slices.value[slice.id]) return
      slices.value[slice.id] = { ...slice, ...audio }
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
    slice.name = layers.map((layer) => layer.name).join(" + ")
    updateSliceOrLayerAudio(slice, {
      ...(await applyEffects(slice.originalAudio, slice.options)),
    })
  }

  /**
   * Trims the file's audio according to the given trim option.
   * Updates the file's trim option to reflect the requested trim.
   *
   * If the given file is a layer, the slice's audio is also updated.
   * @param file - The file to trim.
   * @param option - The trim option to apply.
   */
  async function trimAudio(file: Slice | Layer, option: TrimOption) {
    file.options.trim = option
    updateSliceOrLayerAudio(
      file,
      await applyEffects(file.originalAudio, file.options),
    )
  }

  /**
   * Sets the gain of the file's audio.
   * @param file - The file to update.
   * @param gain - The gain to apply.
   */
  async function setGain(file: EditableAudioFile, gain: number) {
    file.options.gain = Math.min(Math.max(gain, -24), 24)
    updateSliceOrLayerAudio(
      file,
      await applyEffects(file.originalAudio, file.options),
    )
  }

  return {
    // State
    slices,
    activeSliceId,
    activeSlice,
    // Computed
    slicesList,
    totalSlices,
    maxSlicesReached,
    totalDuration,
    durationExceeded,
    activeSliceLayers,
    maxLayersReached,
    // Actions
    renderSlices,
    addSlice,
    duplicateSlice,
    moveSliceUp,
    moveSliceDown,
    removeSlice,
    setActiveSlice,
    addLayer,
    getLayers,
    getLayerCount,
    removeLayer,
    trimAudio,
    setGain,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSlices, import.meta.hot))
}
