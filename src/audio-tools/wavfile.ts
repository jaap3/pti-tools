import { WaveFile } from "wavefile"

import {
  float32ToInt16,
  mergeFloat32Arrays,
} from "@/audio-tools/typedarray-tools"

/**
/**
 * Creates a mono, 44.1kHz, 16-bit PCM WAV file from a Float32Array
 * containing PCM audio data. The values in the input array are assumed to be
 * in the range [-1, 1] and are scaled/clipped to fit in a signed
 * 16-bit integer. Values outside this range will be clipped (meaning that the
 * output audio will be distorted). Cue markers are added at the start of each
 * audio clip (up to a maximum of 48 clips).
 *
 * @param audio - An array of Float32Arrays containing the audio data to encode.
 * @returns ArrayBuffer containing the WAV file.
 */
export function createWaveFileWithCuePoints(
  audio: Float32Array[],
): ArrayBufferLike {
  const mergedAudio = mergeFloat32Arrays(audio)
  const waveFile = new WaveFile()
  waveFile.fromScratch(1, 44100, "16", float32ToInt16(mergedAudio))
  let offset = 0
  for (const slice of audio.slice(0, 48)) {
    waveFile.setCuePoint({ position: offset })
    offset += (slice.length / 44100) * 1000
  }
  return waveFile.toBuffer().buffer
}
