export function sumChannels(input: AudioBuffer, ctx: AudioContext) {
  // Sum multi-channel audio files (e.g. stereo) to mono
  const audio = input.getChannelData(0)

  const nChannels = input.numberOfChannels
  if (nChannels > 1) {
    // Audio file isn't mono, sum all channels

    // The audio var already contains channel one, sum the data from the other channels
    const channels = Array.from({ length: nChannels - 1 }, (_, i) =>
      input.getChannelData(i + 1),
    )
    audio.forEach(
      (value, idx) =>
        (audio[idx] = channels.reduce(
          (sum, channel) => (sum += (channel[idx] || 0) / nChannels),
          value / nChannels,
        )),
    )

    const output = ctx.createBuffer(1, audio.length, input.sampleRate)
    output.copyToChannel(audio, 0)
    return output
  } else {
    return input
  }
}

export function trimSilence(
  input: AudioBuffer,
  ctx: AudioContext,
  fromStart = true,
  fromEnd = true,
) {
  const data = input.getChannelData(0)
  const start = fromStart ? data.findIndex((v) => v !== 0) : 0
  let end = data.length - 1
  if (fromEnd) {
    data.reverse()
    end -= data.findIndex((v) => v !== 0)
    data.reverse()
  }
  const output = ctx.createBuffer(1, end - start, input.sampleRate)
  output.copyToChannel(data.slice(start, end), 0)
  return output
}

export function mergeFloat32Arrays(arrays: Float32Array[]) {
  const length = arrays.reduce((sum, array) => sum + array.length, 0)
  const result = new Float32Array(length)
  let offset = 0
  for (const array of arrays) {
    result.set(array, offset)
    offset += array.length
  }
  return result
}

export function float32ToInt16(data: Float32Array) {
  return Int16Array.from(data, (v) => (v < 0 ? v * 0x8000 : v * 0x7fff))
}

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

export function displayDuration(duration: number) {
  return duration < 1
    ? `${(duration * 1000).toFixed()}ms`
    : `${duration.toFixed(3)}s`
}
