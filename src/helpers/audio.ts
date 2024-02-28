import { sampleRate } from "@/lib/app/constants"

/**
 * Creates a new mono offline audio context of the given lenght,
 * with the sample rate set to 44.1 kHz.
 * @param length - The length of the render buffer in seconds
 * @returns A new OfflineAudioContext
 */
export function getOfflineAudioContext(length = 1): OfflineAudioContext {
  return new OfflineAudioContext(1, length, sampleRate)
}

/**
 * Creates a new mono AudioBuffer with the given data as the channel data.
 * @param data - The audio data to use as the channel data.
 * @param ctx - The audio context to use to create the buffer.
 * @returns A new AudioBuffer
 */
export function createAudioBuffer(
  data: Float32Array,
  ctx: BaseAudioContext = getOfflineAudioContext(),
): AudioBuffer {
  const buffer = ctx.createBuffer(1, data.length, ctx.sampleRate)
  buffer.copyToChannel(data, 0)
  return buffer
}

/**
 * Sums all channels of an AudioBuffer into a single channel.
 * I.e. if the input has 2 channels, the output will have 1 channel.
 * The original input is returned if it has only 1 channel.
 *
 * Note: Phase cancellation may occur when summing channels.
 * @param input - The input AudioBuffer.
 * @returns The summed AudioBuffer.
 */
export async function sumChannels(input: AudioBuffer): Promise<AudioBuffer> {
  if (input.numberOfChannels === 1) return input
  const offline = getOfflineAudioContext(input.length)
  const source = offline.createBufferSource()
  source.buffer = input
  source.connect(offline.destination)
  source.start()
  return await offline.startRendering()
}

/**
 * Trims silence from the start and/or end of an AudioBuffer.
 * @param input - The input AudioBuffer.
 * @param fromStart - Trim silence from the start of the buffer (default: true).
 * @param fromEnd - Trim silence from the end of the buffer (default: true).
 * @param threshold - The minimum amplitude for a sample to be considered
 *    non-silent (default: 0.0005).
 * @returns The trimmed buffer, or the original buffer if both
 *   fromStart and fromEnd are false.
 */
export function trimSilence(
  input: AudioBuffer,
  fromStart = true,
  fromEnd = true,
  threshold = 0.0005,
): AudioBuffer {
  if (!fromStart && !fromEnd) return input
  const data = input.getChannelData(0)
  const start = fromStart ? data.findIndex((v) => Math.abs(v) > threshold) : 0
  let end = data.length
  if (fromEnd) {
    data.reverse()
    end -= data.findIndex((v) => Math.abs(v) > threshold)
    data.reverse()
  }
  const offline = getOfflineAudioContext()
  const output = offline.createBuffer(1, end - start, sampleRate)
  output.copyToChannel(data.slice(start, end), 0)
  return output
}

/**
 * Applies gain to an AudioBuffer.
 *
 * - The output will have a single channel (mono).
 * @param input - The input AudioBuffer.
 * @param gain - The gain to apply, in dB (must be between -24 and 24).
 * @returns The gain-adjusted AudioBuffer, or the original buffer if gain is 0.
 */
export async function applyGain(
  input: AudioBuffer,
  gain: number,
): Promise<AudioBuffer> {
  if (gain === 0) return input
  const offline = getOfflineAudioContext(input.length)
  const { min, max, pow } = Math
  const gainNode = new GainNode(offline, {
    // Convert from dB to linear gain, clamp gain to [-24, 24] dB
    gain: pow(10, min(max(gain, -24), 24) / 20),
  })
  const source = offline.createBufferSource()
  source.buffer = input
  source.connect(gainNode)
  gainNode.connect(offline.destination)
  source.start()
  return await offline.startRendering()
}

/**
 * Combines multiple AudioBuffers into a single AudioBuffer.
 *
 * Depending on the inSequence parameter, the buffers are either combined
 * in sequence (i.e. the output will be the same length as the sum of the
 * input buffer lengths) or in parallel (i.e. the output will be the same
 * length as the longest input buffer).
 *
 * - The output will have a single channel (mono).
 * - If no inputs are provided, an empty buffer is returned.
 * @param input - The input AudioBuffers.
 * @param inSequence - Combine buffers in sequence (default: false).
 * @returns A new AudioBuffer, or the first input if there is only one.
 */
export async function combineAudio(
  input: AudioBuffer[],
  inSequence = false,
): Promise<AudioBuffer> {
  if (input.length <= 1) {
    return input[0] || new AudioBuffer({ length: 0, sampleRate })
  }
  let length = 0
  if (inSequence) {
    // The sum of the length of all input buffers
    length = input.reduce((sum, buffer) => sum + buffer.length, 0)
  } else {
    // The length of the longest input buffer
    length = Math.max(...input.map((buffer) => buffer.length))
  }
  const offline = getOfflineAudioContext(length)
  let start = 0
  for (const file of input) {
    const source = offline.createBufferSource()
    source.buffer = file
    source.connect(offline.destination)
    source.start(start)
    if (inSequence) start += file.duration
  }
  return await offline.startRendering()
}

/**
 * Converts a (mono) AudioBuffer to an Int16Array. The channel data is scaled
 * to fit in the range of a signed 16-bit integer (i.e. [-32768, 32767]).
 * The channel data is assumed to be in the range [-1, 1], values outside this
 * range will be clipped (i.e. -1.1 becomes -1, 1.1 becomes 1).
 * @param input - The AudioBuffer to convert.
 * @returns A new Int16Array containing the data from the Float32Array
 *     scaled/clipped to fit in a 16-bit integer.
 */
export function toInt16(input: AudioBuffer): Int16Array {
  return Int16Array.from(input.getChannelData(0), (v) =>
    v < 0 ? Math.max(-1, v) * 0x8000 : Math.min(v, 1) * 0x7fff,
  )
}
