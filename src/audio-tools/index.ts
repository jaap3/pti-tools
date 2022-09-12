/**
 * Sums all channels of an AudioBuffer into a single channel.
 * I.e. if the input has 2 channels, the output will have 1 channel.
 * The original input is returned if it has only 1 channel.
 * The output sample rate is the same as the input.
 * Note: Phase cancellation may occur when summing channels.
 *
 * @param input - The input AudioBuffer.
 * @returns The summed AudioBuffer.
 */
export async function sumChannels(input: AudioBuffer): Promise<AudioBuffer> {
  if (input.numberOfChannels === 1) return input
  const { length, sampleRate } = input
  const offline = new OfflineAudioContext(1, length, sampleRate)
  const source = offline.createBufferSource()
  source.buffer = input
  source.connect(offline.destination)
  source.start()
  return await offline.startRendering()
}

/**
 * Trims silence from the start and/or end of an AudioBuffer.
 *
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
  let end = data.length - 1
  if (fromEnd) {
    data.reverse()
    end -= data.findIndex((v) => Math.abs(v) > threshold)
    data.reverse()
  }
  const { sampleRate } = input
  const offline = new OfflineAudioContext(1, 1, sampleRate)
  const output = offline.createBuffer(1, end - start, sampleRate)
  output.copyToChannel(data.slice(start, end), 0)
  return output
}

/**
 * Applies gain to an AudioBuffer.
 *
 *  - The output sample rate is the same as the input.
 *  - The output will have a single channel (mono).
 *
 * @param input - The input AudioBuffer.
 * @param gain - The gain to apply, in dB (must be between -24 and 24).
 * @returns The gain-adjusted AudioBuffer, or the original buffer if gain is 1.
 */
export async function applyGain(
  input: AudioBuffer,
  gain: number,
): Promise<AudioBuffer> {
  if (gain === 1) return input
  const { length, sampleRate } = input
  const offline = new OfflineAudioContext(1, length, sampleRate)
  const gainNode = new GainNode(offline, {
    // Convert from dB to linear gain, clamp gain to [-24, 24] dB
    gain: Math.pow(10, Math.min(Math.max(gain, -24), 24) / 20),
  })
  gainNode.connect(offline.destination)
  const source = offline.createBufferSource()
  source.buffer = input
  source.connect(gainNode)
  source.start()
  return await offline.startRendering()
}

/**
 * Combines multiple AudioBuffers into a single AudioBuffer.
 *
 *  - The output sample rate is the same as the first input, all other inputs
 *    are assumed to have the same sample rate.
 *  - The output will have a single channel (mono).
 *  - The length of the output buffer is the same as the longest input buffer.
 *  - If no inputs are provided, an empty buffer is returned.
 *
 * @param input - The input AudioBuffers.
 * @returns The combined AudioBuffer, or the first input if there is only one.
 */
export async function combineAudio(input: AudioBuffer[]): Promise<AudioBuffer> {
  if (input.length <= 1) {
    return input[0] || new AudioBuffer({ length: 0, sampleRate: 44100 })
  }
  const length = Math.max(...input.map((buffer) => buffer.length))
  const sampleRate = (input[0] as AudioBuffer).sampleRate
  const offline = new OfflineAudioContext(1, length, sampleRate)
  for (const file of input) {
    const source = offline.createBufferSource()
    source.buffer = file
    source.connect(offline.destination)
    source.start()
  }
  return await offline.startRendering()
}
