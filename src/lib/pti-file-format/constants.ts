import type { HeaderData } from "./types"

export const samplePlayback = {
  ONE_SHOT: 0,
  FORWARD_LOOP: 1,
  BACKWARD_LOOP: 2,
  PINGPONG_LOOP: 3,
  SLICE: 4,
  BEAT_SLICE: 5,
  WAVETABLE: 6,
  GRANULAR: 7,
} as const

export const automationMode = {
  ENVELOPE: 0,
  LFO: 1,
} as const

export const automationLfoType = {
  REV_SAW: 0,
  SAW: 1,
  TRIANGLE: 2,
  SQUARE: 3,
  RANDOM: 4,
} as const

export const granularShape = {
  SQUARE: 0,
  TRIANGLE: 1,
  GAUSS: 2,
} as const

export const granularLoopMode = {
  FORWARD: 0,
  BACKWARD: 1,
  PINGPONG: 2,
} as const

export const filterType = {
  LOW_PASS: 0,
  HIGH_PASS: 1,
  BAND_PASS: 2,
} as const

export const headerFieldOffset: Readonly<{
  [key in keyof HeaderData]: number
}> = {
  /* Index of values in a .pti header */
  isWavetable: 20,
  instrumentName: 21,
  sampleLength: 60,
  // Wavetable
  wavetableWindowSize: 64,
  wavetableTotalPositions: 68,
  // Sample
  samplePlayback: 76,
  playbackStart: 78,
  loopStart: 80,
  loopEnd: 82,
  playbackEnd: 84,
  wavetablePosition: 88,
  // Volume envelope
  volumeEnvelopeAmount: 92,
  volumeEnvelopeAttack: 98,
  volumeEnvelopeDecay: 102,
  volumeEnvelopeSustain: 104,
  volumeEnvelopeRelease: 108,
  // Volume automation
  volumeAutomationType: 110,
  volumeAutomationEnabled: 111,
  // Panning envelope
  panningEnvelopeAmount: 112,
  panningEnvelopeAttack: 118,
  panningEnvelopeDecay: 122,
  panningEnvelopeSustain: 124,
  panningEnvelopeRelease: 128,
  // Panning automation
  panningAutomationType: 130,
  panningAutomationEnabled: 131,
  // Cutoff envelope
  cutoffEnvelopeAmount: 132,
  cutoffEnvelopeAttack: 138,
  cutoffEnvelopeDecay: 142,
  cutoffEnvelopeSustain: 144,
  cutoffEnvelopeRelease: 148,
  // Cutoff automation
  cutoffAutomationType: 150,
  cutoffAutomationEnabled: 151,
  // Wavetable position envelope
  wavetablePositionEnvelopeAmount: 152,
  wavetablePositionEnvelopeAttack: 158,
  wavetablePositionEnvelopeDecay: 162,
  wavetablePositionEnvelopeSustain: 164,
  wavetablePositionEnvelopeRelease: 168,
  // Wavetable position automation
  wavetablePositionAutomationType: 170,
  wavetablePositionAutomationEnabled: 171,
  // Granular position envelope
  granularPositionEnvelopeAmount: 172,
  granularPositionEnvelopeAttack: 178,
  granularPositionEnvelopeDecay: 182,
  granularPositionEnvelopeSustain: 184,
  granularPositionEnvelopeRelease: 188,
  // Granular position automation
  granularPositionAutomationType: 190,
  granularPositionAutomationEnabled: 191,
  // Finetune envelope
  finetuneEnvelopeAmount: 192,
  finetuneEnvelopeAttack: 198,
  finetuneEnvelopeDecay: 202,
  finetuneEnvelopeSustain: 204,
  finetuneEnvelopeRelease: 208,
  // Finetune automation
  finetuneAutomationType: 210,
  finetuneAutomationEnabled: 211,
  // Volume automation LFO
  volumeLfoType: 212,
  volumeLfoSteps: 213,
  volumeLfoAmount: 216,
  // Panning automation LFO
  panningLfoType: 220,
  panningLfoSteps: 221,
  panningLfoAmount: 224,
  // Cutoff automation LFO
  cutoffLfoType: 228,
  cutoffLfoSteps: 229,
  cutoffLfoAmount: 232,
  // Wavetable position automation LFO
  wavetablePositionLfoType: 236,
  wavetablePositionLfoSteps: 237,
  wavetablePositionLfoAmount: 240,
  // Granular position automation LFO
  granularPositionLfoType: 244,
  granularPositionLfoSteps: 245,
  granularPositionLfoAmount: 248,
  // Finetune automation LFO
  finetuneLfoType: 252,
  finetuneLfoSteps: 253,
  finetuneLfoAmount: 256,
  // Filter
  filterCutoff: 260,
  filterResonance: 264,
  filterType: 268,
  filterEnabled: 269,
  // Instrument parameters
  tune: 270,
  finetune: 271,
  volume: 272,
  panning: 276,
  // Effects
  delaySend: 278,
  // Slices
  slices: 280,
  totalSlices: 376,
  activeSlice: 377,
  // Granular
  granularLength: 378,
  granularPosition: 380,
  granularShape: 382,
  granularLoopMode: 383,
  // More effects
  reverbSend: 384,
  overdrive: 385,
  bitDepth: 386,
} as const

const ptiMagicBytes = new Uint8Array([
  84, 73, 1, 0, 1, 5, 0, 1, 9, 9, 9, 9, 116, 1, 0, 0, 1, 0, 0, 0,
])

export const defaultPtiHeader: ArrayBuffer = (() => {
  const header = new ArrayBuffer(392)
  // Copy the magic bytes
  new Uint8Array(header).set(ptiMagicBytes)
  const view = new DataView(header)

  const {
    wavetableWindowSize,
    loopStart,
    loopEnd,
    playbackEnd,
    volumeEnvelopeAmount,
    volumeEnvelopeSustain,
    volumeEnvelopeRelease,
    volumeLfoType,
    volumeLfoAmount,
    volumeAutomationEnabled,
    panningEnvelopeAmount,
    panningEnvelopeSustain,
    panningEnvelopeRelease,
    panningLfoType,
    panningLfoAmount,
    cutoffEnvelopeAmount,
    cutoffEnvelopeSustain,
    cutoffEnvelopeRelease,
    cutoffLfoType,
    cutoffLfoAmount,
    wavetablePositionEnvelopeAmount,
    wavetablePositionEnvelopeSustain,
    wavetablePositionEnvelopeRelease,
    wavetablePositionLfoType,
    wavetablePositionLfoAmount,
    granularPositionEnvelopeAmount,
    granularPositionEnvelopeSustain,
    granularPositionEnvelopeRelease,
    granularPositionLfoType,
    granularPositionLfoAmount,
    finetuneEnvelopeAmount,
    finetuneEnvelopeSustain,
    finetuneEnvelopeRelease,
    finetuneLfoType,
    finetuneLfoAmount,
    filterCutoff,
    volume,
    panning,
    granularLength,
    bitDepth,
  } = headerFieldOffset
  const { TRIANGLE } = automationLfoType
  // Set the defaults
  view.setInt16(wavetableWindowSize, 2048, true)
  view.setInt16(loopStart, 1, true)
  view.setInt16(loopEnd, 65534, true)
  view.setInt16(playbackEnd, 65535, true)
  // Volume automation
  view.setFloat32(volumeEnvelopeAmount, 1.0, true)
  view.setFloat32(volumeEnvelopeSustain, 1.0, true)
  view.setUint16(volumeEnvelopeRelease, 1000, true)
  view.setUint8(volumeAutomationEnabled, 1) // Envelope
  view.setUint8(volumeLfoType, TRIANGLE) // LFO type
  view.setFloat32(volumeLfoAmount, 0.5, true)
  // Panning automation
  view.setFloat32(panningEnvelopeAmount, 1.0, true)
  view.setFloat32(panningEnvelopeSustain, 1.0, true)
  view.setInt16(panningEnvelopeRelease, 1000, true)
  view.setUint8(panningLfoType, TRIANGLE) // LFO type
  view.setFloat32(panningLfoAmount, 0.5, true)
  // Cutoff automation
  view.setFloat32(cutoffEnvelopeAmount, 1.0, true)
  view.setFloat32(cutoffEnvelopeSustain, 1.0, true)
  view.setInt16(cutoffEnvelopeRelease, 1000, true)
  view.setUint8(cutoffLfoType, TRIANGLE) // LFO type
  view.setFloat32(cutoffLfoAmount, 0.5, true)
  // Wavetable position automation
  view.setFloat32(wavetablePositionEnvelopeAmount, 1.0, true)
  view.setFloat32(wavetablePositionEnvelopeSustain, 1.0, true)
  view.setInt16(wavetablePositionEnvelopeRelease, 1000, true)
  view.setUint8(wavetablePositionLfoType, TRIANGLE)
  view.setFloat32(wavetablePositionLfoAmount, 0.5, true)
  // Granular position automation
  view.setFloat32(granularPositionEnvelopeAmount, 1.0, true)
  view.setFloat32(granularPositionEnvelopeSustain, 1.0, true)
  view.setInt16(granularPositionEnvelopeRelease, 1000, true)
  view.setUint8(granularPositionLfoType, TRIANGLE)
  view.setFloat32(granularPositionLfoAmount, 0.5, true)
  // Finetune automation
  view.setFloat32(finetuneEnvelopeAmount, 1.0, true)
  view.setFloat32(finetuneEnvelopeSustain, 1.0, true)
  view.setInt16(finetuneEnvelopeRelease, 1000, true)
  view.setUint8(finetuneLfoType, TRIANGLE)
  view.setFloat32(finetuneLfoAmount, 0.5, true)
  // Filter
  view.setFloat32(filterCutoff, 1.0, true)
  // Parameters
  view.setUint8(volume, 50)
  view.setUint8(panning, 50)
  // Granular
  view.setInt16(granularLength, 441, true)
  // Effects
  view.setUint8(bitDepth, 16)

  return header
})()
