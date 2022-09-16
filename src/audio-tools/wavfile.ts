import { WaveFile } from "wavefile"

import { float32ToInt16 } from "@/audio-tools/typedarray-tools"
import type { Slice } from "@/stores/slices"

/**
/**
 * Creates a mono, 44.1kHz, 16-bit PCM WAV file from a Float32Array
 * containing PCM audio data. The values in the input array are assumed to be
 * in the range [-1, 1] and are scaled/clipped to fit in a signed
 * 16-bit integer. Values outside this range will be clipped (meaning that the
 * output audio will be distorted). A cue point is created at the start of each
 * audio slice (up to a maximum of 48 slices).
 *
 * @param audio - A Float32Array containing the audio data to encode.
 * @param slices - An array of slices, used to set the cue markers.
 * @returns ArrayBuffer containing the WAV file.
 */
export function createWaveFileWithCuePoints(
  audio: Float32Array,
  slices: Slice[],
): ArrayBufferLike {
  const waveFile = new WaveFile()
  waveFile.fromScratch(1, 44100, "16", float32ToInt16(audio))
  let offset = 0
  for (const slice of slices.slice(0, 48)) {
    waveFile.setCuePoint({ position: offset })
    offset += slice.duration * 1000
  }
  return waveFile.toBuffer().buffer
}
