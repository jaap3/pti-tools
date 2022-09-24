import { defineStore } from "pinia"

import { createAudioBuffer } from "@/helpers/audio"
import { sampleRate } from "@/lib/app/constants"

export const useAudioContext = defineStore("audiocontext", () => {
  const ctx = new AudioContext({
    latencyHint: "interactive",
    sampleRate,
  })

  let source: AudioBufferSourceNode | null = null

  /**
   * Stops the playback of the AudioBufferSourceNode most recently created
   * by getAudioBufferSourceNode (if any).
   */
  function stopPlayback() {
    source?.stop()
    source?.disconnect()
    source = null
  }

  /**
   * Creates a new AudioBufferSourceNode from the given audio data.
   * Any previous AudioBufferSourceNode created by this function
   * is disconnected and disposed.
   *
   * @param audio - The audio data to create the node from.
   * @returns The new AudioBufferSourceNode.
   */
  function getAudioBufferSourceNode(
    audio: Float32Array,
  ): AudioBufferSourceNode {
    stopPlayback()
    const buffer = createAudioBuffer(audio, ctx)
    source = new AudioBufferSourceNode(ctx, { buffer })
    return source
  }

  return {
    ctx,
    getAudioBufferSourceNode,
    stopPlayback,
  }
})
