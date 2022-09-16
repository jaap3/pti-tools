import { WaveFile } from "wavefile"

import type { Slice } from "@/stores/slices"

/**
/**
 * Creates a mono, 44.1kHz, 16-bit PCM WAV file from a Int16Array containing
 * PCM audio data. A cue point is created at the start of each slice
 * (up to a maximum of 48 slices).
 *
 * @param audio - A Int16Array containing the audio data to encode.
 * @param slices - An array of slices, used to set the cue markers.
 * @returns ArrayBuffer containing the WAV file.
 */
export function createWaveFileWithCuePoints(
  audio: Int16Array,
  slices: Slice[],
): ArrayBufferLike {
  const waveFile = new WaveFile()
  waveFile.fromScratch(1, 44100, "16", audio)
  let offset = 0
  for (const slice of slices.slice(0, 48)) {
    waveFile.setCuePoint({ position: offset })
    offset += slice.duration * 1000
  }
  return waveFile.toBuffer().buffer
}
