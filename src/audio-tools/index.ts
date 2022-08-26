export async function sumChannels(input: AudioBuffer) {
  const offline = new OfflineAudioContext(1, input.length, input.sampleRate)
  const source = offline.createBufferSource()
  source.buffer = input
  source.connect(offline.destination)
  source.start()
  return await offline.startRendering()
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
