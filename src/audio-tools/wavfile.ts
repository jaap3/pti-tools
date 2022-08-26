import { float32ToInt16 } from "@/audio-tools/typedarray-tools"

const WAV_HEADER = new Uint8Array([
  // RIFF/WAVE
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
  // fmt PCM, mono, 44100 Hz, 16 bit
  0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x44,
  0xac, 0x00, 0x00, 0x88, 0x58, 0x10, 0x00, 0x02, 0x00, 0x10, 0x00,
  // data
  0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00,
])

export function getWavFile(data: Float32Array) {
  // Create a mono, 16 bit PCM WAV file from an AudioBuffer's channel data.
  // Sample rate is assumed to be 44100 Hz
  // Calculate the number of bytes in the audio data
  const headerLength = WAV_HEADER.length
  const audioLength = data.length * Int16Array.BYTES_PER_ELEMENT
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(headerLength + audioLength)
  // Write the default WAV header to the buffer
  new Uint8Array(buffer).set(WAV_HEADER)
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(headerLength - 4, audioLength, true)
  // Write the audio data to the buffer (converting from float to 16 bit PCM)
  new Int16Array(buffer, headerLength).set(float32ToInt16(data))
  return new Blob([buffer], { type: "audio/wav" })
}
