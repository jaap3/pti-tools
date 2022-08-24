import { computed, ref } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"
import { useMessages } from "@/stores/messages"
import { sumChannels, trimSilence } from "@/audio-tools"

export interface AudioFile {
  name: string
  originalAudio: AudioBuffer
  audio: AudioBuffer
}

export type TrimOption = "none" | "start" | "end" | "both"

const maxFiles = 48
const maxDuration = 45 // seconds

export const useAudioFiles = defineStore("audiofiles", () => {
  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  })

  const messagesStore = useMessages()
  const audioFiles = ref<AudioFile[]>([])

  let source: AudioBufferSourceNode | null = null

  async function addFile(name: string, file: ArrayBuffer) {
    if (maxFilessReached.value) {
      messagesStore.addMessage(
        `Rejected "${name}", max. ${maxFiles} slices reached.`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    const audio = await ctx.decodeAudioData(file)
    if (audio.duration > maxDuration) {
      messagesStore.addMessage(
        `Rejected "${name}", too long (>${maxDuration}s).`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    if (totalDuration.value > 45) {
      messagesStore.addMessage(
        `Rejected "${name}", total duration > ${maxDuration}.`,
        "warning",
        { timeout: 8500 },
      )
      return
    }

    const monoAudio = sumChannels(audio, ctx)
    audioFiles.value.push({
      name,
      audio: monoAudio,
      originalAudio: monoAudio,
    })
  }

  function moveFileUp(file: AudioFile) {
    const idx = audioFiles.value.indexOf(file)
    audioFiles.value.splice(idx, 1)
    audioFiles.value.splice(idx - 1, 0, file)
  }

  function moveFileDown(file: AudioFile) {
    const idx = audioFiles.value.indexOf(file)
    audioFiles.value.splice(idx, 1)
    audioFiles.value.splice(idx + 1, 0, file)
  }

  function removeFile(file: AudioFile) {
    audioFiles.value.splice(audioFiles.value.indexOf(file), 1)
  }

  function trimFile(file: AudioFile, option: TrimOption) {
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

  const maxFilessReached = computed(() => audioFiles.value.length >= maxFiles)

  const totalDuration = computed(() =>
    audioFiles.value.reduce((sum, file) => sum + file.audio.duration, 0),
  )

  const durationExceeded = computed(() => totalDuration.value > maxDuration)

  return {
    audioContext: ctx,
    audioFiles,
    addFile,
    moveFileUp,
    moveFileDown,
    removeFile,
    trimFile,
    getAudioBufferSourceNode,
    stopPlayback,
    maxFiles,
    maxFilessReached,
    totalDuration,
    maxDuration,
    durationExceeded,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAudioFiles, import.meta.hot))
}
