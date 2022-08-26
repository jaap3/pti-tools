import { float32ToInt16, mergeFloat32Arrays } from "@/audio-tools"

import {
  MAX_SLICES,
  defaultPtiHeader,
  samplePlayback,
  headerFieldOffset,
} from "@/pti-file-format/constants"

const asciiEncoder: TextEncoder = new TextEncoder()

export function createBeatSlicedPtiFromSamples(
  audio: Float32Array[],
  instrumentName: string,
) {
  const mergedAudio = mergeFloat32Arrays(audio)
  const totalLength = mergedAudio.length

  const buffer = getPtiFile(mergedAudio)

  // Write instrument name to header
  asciiEncoder.encodeInto(
    (instrumentName || "stitched").substring(0, 31).padEnd(31, "\x00"),
    new Uint8Array(buffer, headerFieldOffset.instrumentName, 31),
  )

  const view = new DataView(buffer)
  // Set sample playback to beat sliced
  view.setUint8(headerFieldOffset.samplePlayback, samplePlayback.BEAT_SLICE)
  // Set the amount of slices to the total number of entries in the audio array
  // (or 48, whichever is smaller).
  view.setUint8(
    headerFieldOffset.totalSlices,
    Math.min(audio.length, MAX_SLICES),
  )

  let offset = 0 // Slice offset
  for (const [idx, slice] of audio.entries()) {
    if (idx >= MAX_SLICES) break // Stop if we have written all possible slices
    view.setUint16(
      // Slice 1 is 280, slice 2 is 282, slice 3 is 284, etc.
      headerFieldOffset.slices + idx * 2,
      // Slice offsets are relative to the length of the audio,
      // i.e. slice 1 is at 0%, slice 2 is at 25%, etc.
      (offset / totalLength) * 65535,
      true,
    )
    // the next slice starts immediatly after the current slice
    // (plus any preceeding slices)
    offset += slice.length
  }
  return buffer
}

export function getPtiFile(data: Float32Array) {
  // Calculate the number of bytes in the audio data
  const length = data.length * Int16Array.BYTES_PER_ELEMENT
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(defaultPtiHeader.byteLength + length)
  // Write the default PTI header to the buffer
  new Uint8Array(buffer).set(new Uint8Array(defaultPtiHeader))
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(headerFieldOffset.sampleLength, length, true)
  // Write the audio data to the buffer (converting from float to 16 bit PCM)
  new Int16Array(buffer, defaultPtiHeader.byteLength).set(float32ToInt16(data))
  return buffer
}

export { samplePlayback }
