import {
  float32ToInt16,
  mergeFloat32Arrays,
} from "@/audio-tools/typedarray-tools"
import {
  defaultPtiHeader,
  headerFieldOffset,
  MAX_SLICES,
  samplePlayback,
} from "@/pti-file-format/constants"

const asciiEncoder: TextEncoder = new TextEncoder()

/**
 * Creates a new Polyend Tracker Instrument file (.pti) with the given
 * audio data. The values in the input array are assumed to be in the range
 * [-1, 1] and are scaled/clipped to fit in a signed 16-bit integer.
 * Values outside this range will be clipped (meaning that the output
 * audio will be distorted).
 *
 * @param audio - A Float32Array containing the audio data to encode.
 * @returns ArrayBuffer containing the PTI file.
 */
export function getPtiFile(audio: Float32Array): ArrayBuffer {
  // Calculate the number of bytes in the audio data
  const length = audio.length * Int16Array.BYTES_PER_ELEMENT
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(defaultPtiHeader.byteLength + length)
  // Write the default PTI header to the buffer
  new Uint8Array(buffer).set(new Uint8Array(defaultPtiHeader))
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(headerFieldOffset.sampleLength, length, true)
  // Write the audio data to the buffer (converting from float to 16 bit PCM)
  new Int16Array(buffer, defaultPtiHeader.byteLength).set(float32ToInt16(audio))
  return buffer
}

/**
 * Creates a new Polyend Tracker Instrument file (.pti), containing the
 * given audio data concatenated sequentially. Playback mode of the instrument
 * is set to "Beat Slice" and slice markers are set at the start of each
 * audio clip (up to a maximum of 48 slices).
 *
 * If the number of entries in the audio array is greater than 48, the audio
 * will still be concatenated, but slice markers for only the first 48 clips
 * will be set. This is a limitation of the PTI file format.
 *
 * The values in the input arrays are assumed to be in the range
 * [-1, 1] and are scaled/clipped to fit in a signed 16-bit integer.
 * Values outside this range will be clipped (meaning that the output
 * audio will be distorted).
 *
 * @param audio - An array of Float32Arrays containing the audio data to encode.
 * @param instrumentName - The name of the instrument, max 31 characters
 *    (default: "stitched").
 * @returns ArrayBuffer containing the PTI file.
 */
export function createBeatSlicedPtiFromSamples(
  audio: Float32Array[],
  instrumentName: string,
): ArrayBuffer {
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

  // Limit the number of slices to 48
  const slices = audio.slice(0, MAX_SLICES)

  // Set the amount of slices to the total number of entries in the slices array
  // (or 1, if the array is empty).
  view.setUint8(headerFieldOffset.totalSlices, Math.max(1, slices.length))

  let offset = 0 // Slice offset
  for (const [idx, slice] of audio.slice(0, 48).entries()) {
    view.setUint16(
      // Slice 1 is 280, slice 2 is 282, slice 3 is 284, etc.
      headerFieldOffset.slices + idx * 2,
      // Slice offsets are relative to the length of the audio,
      // i.e. slice 1 is at 0%, slice 2 is at 25%, etc.
      (offset / totalLength) * 65535,
      true,
    )
    // the next slice starts immediately after the current slice
    // (plus any preceding slices)
    offset += slice.length
  }
  return buffer
}
