import { computed, ref } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"
import { useMessages } from "@/stores/messages"
import { sumChannels, trimSilence } from "@/audio-tools"

export interface AudioFile {
  id: string
  name: string
  originalAudio: AudioBuffer
  audio: AudioBuffer
}

export interface Slice extends AudioFile {
  layers: AudioFile[]
}

export type TrimOption = "none" | "start" | "end" | "both"

const maxSlices = 48
const maxDuration = 45 // seconds

export const useSlices = defineStore("slices", () => {
  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })

  const messagesStore = useMessages()
  const slices = ref<Slice[]>([])

  let source: AudioBufferSourceNode | null = null

  async function addSlice(name: string, file: ArrayBuffer) {
    if (maxSlicesReached.value) {
      messagesStore.addMessage(
        `Rejected "${name}", max. ${maxSlices} slices reached.`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    if (durationExceeded.value) {
      messagesStore.addMessage(
        `Rejected "${name}", total duration > ${maxDuration}.`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    let audio: AudioBuffer
    try {
      audio = await ctx.decodeAudioData(file)
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
    slices.value.push({
      id: crypto.randomUUID(),
      name,
      audio: monoAudio,
      originalAudio: monoAudio,
      layers: [],
    })
  }

  function moveSliceUp(slice: Slice) {
    const idx = slices.value.indexOf(slice)
    slices.value.splice(idx, 1)
    slices.value.splice(idx - 1, 0, slice)
  }

  function moveSliceDown(slice: Slice) {
    const idx = slices.value.indexOf(slice)
    slices.value.splice(idx, 1)
    slices.value.splice(idx + 1, 0, slice)
  }

  function removeSlice(slice: Slice) {
    slices.value.splice(slices.value.indexOf(slice), 1)
  }

  function trimAudio(file: AudioFile, option: TrimOption) {
    if (ctx === undefined) return

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
  }

  function getAudioBufferSourceNode(file: AudioFile) {
    stopPlayback()
    const { audio: buffer } = file
    source = new AudioBufferSourceNode(ctx, { buffer })
    return source
  }

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
    addSlice,
    moveSliceUp,
    moveSliceDown,
    removeSlice,
    trimAudio,
    getAudioBufferSourceNode,
    stopPlayback,
    maxSlices,
    totalSlices,
    maxSlicesReached,
    totalDuration,
    maxDuration,
    durationExceeded,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSlices, import.meta.hot))
}
