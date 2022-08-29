export async function sumChannels(input: AudioBuffer) {
  const { length, sampleRate } = input
  const offline = new OfflineAudioContext(1, length, sampleRate)
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
  threshold = 0.0005,
) {
  const data = input.getChannelData(0)
  const start = fromStart ? data.findIndex((v) => Math.abs(v) > threshold) : 0
  let end = data.length - 1
  if (fromEnd) {
    data.reverse()
    end -= data.findIndex((v) => Math.abs(v) > threshold)
    data.reverse()
  }
  const output = ctx.createBuffer(1, end - start, input.sampleRate)
  output.copyToChannel(data.slice(start, end), 0)
  return output
}

export async function combineAudio(input: AudioBuffer[]) {
  if (input.length === 1) return input[0] as AudioBuffer // no need to combine
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
