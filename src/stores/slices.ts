import { acceptHMRUpdate, defineStore } from "pinia"
import { computed, ref } from "vue"

import { combineAudio, sumChannels, trimSilence } from "@/audio-tools"
import { useMessages } from "@/stores/messages"

interface AudioFileOptions {
  trim: TrimOption
}

export interface AudioFile {
  id: string
  name: string
  originalAudio: AudioBuffer
  audio: AudioBuffer
  options: AudioFileOptions
}

export interface Layer extends AudioFile {
  slice: WeakRef<Slice>
}

export interface Slice extends AudioFile {
  layers: Layer[]
}

export type TrimOption = "none" | "start" | "end" | "both"

const maxSlices = 48
const maxDuration = 45 // seconds
const maxLayers = 12

class Mutex {
  private promise = Promise.resolve()

  lock() {
    let resolver: () => void
    const currentPromise = this.promise
    this.promise = new Promise<void>((resolve) => {
      resolver = () => resolve()
    })
    const unlock = currentPromise.then(() => resolver)
    return unlock
  }
}

export const useSlices = defineStore("slices", () => {
  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })

  const messagesStore = useMessages()
  const slices = ref<Slice[]>([])
  const editSlice = ref<Slice | null>(null)

  const sliceMutex = new Mutex()
  const layerMutex = new Mutex()

  let source: AudioBufferSourceNode | null = null

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
   *     become a slice or layer.
   */
  // TODO: Raise errors instead of adding messages and returning null.
  async function loadAudio(file: File): Promise<AudioFile | undefined> {
    const name = file.name
    const buffer = await file.arrayBuffer()

    let audio: AudioBuffer
    try {
      audio = await ctx.decodeAudioData(buffer)
    } catch (e) {
      messagesStore.addMessage(
        `Rejected "${name}", invalid audio file.`,
        "error",
        { timeout: 8500 },
      )
      return
    }
    if (audio.duration > maxDuration) {
      messagesStore.addMessage(
        `Rejected "${name}", too long (>${maxDuration}s).`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    const monoAudio = await sumChannels(audio)
    return {
      id: crypto.randomUUID(),
      name: displayName(name),
      audio: monoAudio,
      originalAudio: monoAudio,
      options: {
        trim: "none",
      },
    }
  }

  /**
   * Attempts to load an audio file and add it to the store.
   *
   * @param file - A File object.
   */
  // TODO: Raise errors instead of adding messages and returning null.
  async function addSlice(file: File) {
    const name = file.name

    const unlock = await sliceMutex.lock()

    try {
      if (maxSlicesReached.value) {
        messagesStore.addMessage(
          `Rejected "${name}", max. ${maxSlices} slices reached.`,
          "warning",
          { timeout: 8500 },
        )
      } else if (durationExceeded.value) {
        messagesStore.addMessage(
          `Rejected "${name}", total duration > ${maxDuration}.`,
          "warning",
          { timeout: 8500 },
        )
      } else {
        const audioFile = await loadAudio(file)
        if (audioFile) {
          const slice = {
            ...audioFile,
            layers: [] as Layer[],
          }
          const layer = {
            ...audioFile,
            options: { ...audioFile.options },
            id: crypto.randomUUID(),
            slice: new WeakRef(slice),
          }
          slice.layers.push(layer)
          slices.value.push(slice)
        }
      }
    } finally {
      unlock()
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
    setEditSlice(null)
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
  function setEditSlice(slice: Slice | null) {
    if (slice && !slices.value.includes(slice)) return
    editSlice.value = slice
  }

  /**
   * Attempts to load an audio file and add it to the slice as a new layer.
   *
   * @param slice - The slice to add the layer to.
   * @param file - A File object.
   */
  // TODO: Raise errors instead of adding messages and returning null.
  async function addLayer(slice: Slice, file: File) {
    const unlock = await layerMutex.lock()
    const name = file.name
    try {
      if (slice.layers.length >= maxLayers) {
        messagesStore.addMessage(
          `Rejected "${name}", max. ${maxLayers} layers reached.`,
          "warning",
          { timeout: 8500 },
        )
      } else {
        const audioFile = await loadAudio(file)
        if (audioFile) {
          const layer = {
            ...audioFile,
            slice: new WeakRef(slice),
          }
          slice.layers.push(layer)
        }
        await handleLayerChange(slice)
      }
    } finally {
      unlock()
    }
  }

  /**
   * Removes a layer from the slice. Does nothing if the slice has only one
   * layer, or if the layer is not contained in the slice.
   *
   * @param slice - The slice to remove the layer from.
   * @param layer - The layer to remove.
   */
  // TODO: Pick the slice from the layer instead of passing it as a parameter.
  // TODO: Raise errors instead of adding messages.
  async function removeLayer(slice: Slice, layer: Layer) {
    const unlock = await layerMutex.lock()
    try {
      if (slice.layers.length <= 1) {
        messagesStore.addMessage(
          `Cannot remove layer, a slice must have at least one layer.`,
          "warning",
          { timeout: 8500 },
        )
      } else {
        const idx = slice.layers.indexOf(layer)
        if (idx === -1) return
        slice.layers.splice(idx, 1)
        await handleLayerChange(slice)
      }
    } finally {
      unlock()
    }
  }

  /**
   * Replaces the slice's audio with the combined audio of all its layers.
   * Updates the slice's name to reflect the names of its layers.
   *
   * @param slice - The slice to update.
   */
  async function handleLayerChange(slice: Slice) {
    slice.originalAudio = await combineAudio(
      slice.layers.map((layer) => layer.audio),
    )
    trimAudio(slice, slice.options.trim)
    slice.name = slice.layers.map((layer) => layer.name).join(" + ")
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
  function trimAudio(file: AudioFile | Slice | Layer, option: TrimOption) {
    if (ctx === undefined) return

    file.options.trim = option

    const audio = file.originalAudio
    switch (option) {
      case "none":
        file.audio = audio
        break
      case "start":
        file.audio = trimSilence(audio, ctx, true, false)
        break
      case "end":
        file.audio = trimSilence(audio, ctx, false, true)
        break
      case "both":
        file.audio = trimSilence(audio, ctx)
        break
    }

    if ("slice" in file) {
      const slice = file.slice.deref()
      if (slice) handleLayerChange(slice)
    }
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

  const totalSlices = computed(() => slices.value.length)

  const maxSlicesReached = computed(() => totalSlices.value >= maxSlices)

  const totalDuration = computed(() =>
    slices.value.reduce((sum, file) => sum + file.audio.duration, 0),
  )

  const durationExceeded = computed(() => totalDuration.value > maxDuration)

  return {
    audioContext: ctx,
    slices,
    editSlice,
    addSlice,
    moveSliceUp,
    moveSliceDown,
    removeSlice,
    setEditSlice,
    addLayer,
    removeLayer,
    trimAudio,
    getAudioBufferSourceNode,
    stopPlayback,
    maxSlices,
    totalSlices,
    maxSlicesReached,
    totalDuration,
    maxDuration,
    durationExceeded,
    maxLayers,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSlices, import.meta.hot))
}
