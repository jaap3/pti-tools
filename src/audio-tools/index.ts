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
