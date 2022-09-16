import type {
  filterType,
  granularLoopMode,
  granularShape,
  samplePlayback,
} from "./constants"

export type SamplePlayback = typeof samplePlayback[keyof typeof samplePlayback]

export type GranularShape = typeof granularShape[keyof typeof granularShape]

export type GranularLoopMode =
  typeof granularLoopMode[keyof typeof granularLoopMode]

export type FilterType = typeof filterType[keyof typeof filterType]

export type HeaderData = {
  isWavetable: boolean
  instrumentName: string
  sampleLength: number
  // Wavetable
  wavetableWindowSize: number
  wavetableTotalPositions: number
  // Sample
  samplePlayback: SamplePlayback
  playbackStart: number
  loopStart: number
  loopEnd: number
  playbackEnd: number
  wavetablePosition: number
  // Volume envelope
  volumeEnvelopeAmount: number
  volumeEnvelopeAttack: number
  volumeEnvelopeDecay: number
  volumeEnvelopeSustain: number
  volumeEnvelopeRelease: number
  // Volume automation
  volumeAutomationType: number
  volumeAutomationEnabled: boolean
  // Panning envelope
  panningEnvelopeAmount: number
  panningEnvelopeAttack: number
  panningEnvelopeDecay: number
  panningEnvelopeSustain: number
  panningEnvelopeRelease: number
  // Panning automation
  panningAutomationType: number
  panningAutomationEnabled: boolean
  // Cutoff envelope
  cutoffEnvelopeAmount: number
  cutoffEnvelopeAttack: number
  cutoffEnvelopeDecay: number
  cutoffEnvelopeSustain: number
  cutoffEnvelopeRelease: number
  // Cutoff automation
  cutoffAutomationType: number
  cutoffAutomationEnabled: boolean
  // Wavetable position envelope
  wavetablePositionEnvelopeAmount: number
  wavetablePositionEnvelopeAttack: number
  wavetablePositionEnvelopeDecay: number
  wavetablePositionEnvelopeSustain: number
  wavetablePositionEnvelopeRelease: number
  // Wavetable position automation
  wavetablePositionAutomationType: number
  wavetablePositionAutomationEnabled: boolean
  // Granular position envelope
  granularPositionEnvelopeAmount: number
  granularPositionEnvelopeAttack: number
  granularPositionEnvelopeDecay: number
  granularPositionEnvelopeSustain: number
  granularPositionEnvelopeRelease: number
  // Granular position automation
  granularPositionAutomationType: number
  granularPositionAutomationEnabled: boolean
  // Finetune envelope
  finetuneEnvelopeAmount: number
  finetuneEnvelopeAttack: number
  finetuneEnvelopeDecay: number
  finetuneEnvelopeSustain: number
  finetuneEnvelopeRelease: number
  // Finetune automation
  finetuneAutomationType: number
  finetuneAutomationEnabled: boolean
  // Volume automation LFO
  volumeLfoType: number
  volumeLfoSteps: number
  volumeLfoAmount: number
  // Panning automation LFO
  panningLfoType: number
  panningLfoSteps: number
  panningLfoAmount: number
  // Cutoff automation LFO
  cutoffLfoType: number
  cutoffLfoSteps: number
  cutoffLfoAmount: number
  // Wavetable position automation LFO
  wavetablePositionLfoType: number
  wavetablePositionLfoSteps: number
  wavetablePositionLfoAmount: number
  // Granular position automation LFO
  granularPositionLfoType: number
  granularPositionLfoSteps: number
  granularPositionLfoAmount: number
  // Finetune automation LFO
  finetuneLfoType: number
  finetuneLfoSteps: number
  finetuneLfoAmount: number
  // Filter
  filterCutoff: number
  filterResonance: number
  filterType: FilterType
  filterEnabled: boolean
  // Instrument parameters
  tune: number
  finetune: number
  volume: number
  panning: number
  // Effects
  delaySend: number
  // Slices
  slices: number[]
  totalSlices: number
  activeSlice: number
  // Granular
  granularLength: number
  granularPosition: number
  granularShape: GranularShape
  granularLoopMode: GranularLoopMode
  // More effects
  reverbSend: number
  overdrive: number
  bitDepth: number
}
