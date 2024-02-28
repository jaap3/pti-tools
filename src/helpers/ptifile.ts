import { maxSlices } from "@/lib/app/constants"
import type { Slice } from "@/lib/app/types"
import {
  defaultPtiHeader,
  headerFieldOffset,
  samplePlayback,
} from "@/lib/pti-file-format/constants"

const asciiEncoder: TextEncoder = new TextEncoder()

/**
 * Creates a new Polyend Tracker Instrument file (.pti) with the given
 * audio data.
 * @param audio - An Int16Array containing the audio data to encode.
 * @returns ArrayBuffer containing the PTI file.
 */
export function getPtiFile(audio: Int16Array): ArrayBuffer {
  // Calculate the number of bytes in the audio data
  const length = audio.byteLength
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(defaultPtiHeader.byteLength + length)
  // Write the default PTI header to the buffer
  new Uint8Array(buffer).set(new Uint8Array(defaultPtiHeader))
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(headerFieldOffset.sampleLength, length, true)
  // Write the audio data to the buffer
  new Int16Array(buffer, defaultPtiHeader.byteLength).set(audio)
  return buffer
}

/**
 * Creates a new Polyend Tracker Instrument file (.pti), containing the
 * given audio data.
 *
 * Playback mode of the instrument is set to "Beat Slice" and slice markers are
 * set at the start of each audio clip (up to a maximum of 48 slices).
 * @param audio - An Int16Array containing the audio data to encode.
 * @param slices - An array of slices, used to set the slice markers.
 * @param instrumentName - The name of the instrument, max 31 characters
 *    (default: "stitched").
 * @returns ArrayBuffer containing the PTI file.
 */
export function createBeatSlicedPti(
  audio: Int16Array,
  slices: Slice[],
  instrumentName: string,
): ArrayBuffer {
  const totalDuration = slices.reduce((sum, slice) => sum + slice.duration, 0)

  const buffer = getPtiFile(audio)

  // Write instrument name to header
  asciiEncoder.encodeInto(
    (instrumentName || "stitched").substring(0, 31).padEnd(31, "\x00"),
    new Uint8Array(buffer, headerFieldOffset.instrumentName, 31),
  )

  const view = new DataView(buffer)

  // Set sample playback to beat sliced
  view.setUint8(headerFieldOffset.samplePlayback, samplePlayback.BEAT_SLICE)

  // Set the amount of slices to the total number of entries in the slices array
  // (or 1, if the array is empty).
  view.setUint8(headerFieldOffset.totalSlices, Math.max(1, slices.length))

  let start = 0 // Slice start
  for (const [idx, slice] of slices.slice(0, maxSlices).entries()) {
    view.setUint16(
      // Slice 1 is 280, slice 2 is 282, slice 3 is 284, etc.
      headerFieldOffset.slices + idx * 2,
      // Slice offsets are relative to the length of the audio,
      // i.e. slice 1 is at 0%, slice 2 is at 25%, etc.
      (start / totalDuration) * 65535,
      true,
    )
    // the next slice starts immediately after the current slice
    // (plus any preceding slices)
    start += slice.duration
  }
  return buffer
}
