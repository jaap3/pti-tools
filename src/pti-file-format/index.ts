import { float32ToInt16, mergeFloat32Arrays } from "../audio-tools";

export const SamplePlayback = {
  ONE_SHOT: 0,
  FORWARD_LOOP: 1,
  BACKWARD_LOOP: 2,
  PINGPONG_LOOP: 3,
  SLICE: 4,
  BEAT_SLICE: 5,
  WAVETABLE: 6,
  GRANULAR: 7,
} as const;
export type SamplePlaybackType =
  typeof SamplePlayback[keyof typeof SamplePlayback];

export const GranularShape = {
  SQUARE: 0,
  TRIANGLE: 1,
  GAUSS: 2,
} as const;
export type GranularShapeType =
  typeof GranularShape[keyof typeof GranularShape];

export const GranularLoopMode = {
  FORWARD: 0,
  BACKWARD: 1,
  PINGPONG: 2,
} as const;
export type GranularLoopModeType =
  typeof GranularLoopMode[keyof typeof GranularLoopMode];

const FilterType = {
  LOW_PASS: 0,
  HIGH_PASS: 1,
  BAND_PASS: 2,
} as const;
export type FilterTypeType = typeof FilterType[keyof typeof FilterType];

export type HeaderData = {
  isWavetable: boolean;
  instrumentName: string;
  sampleLength: number;
  // Wavetable
  wavetableWindowSize: number;
  wavetableTotalPositions: number;
  // Sample
  samplePlayback: SamplePlaybackType;
  playbackStart: number;
  loopStart: number;
  loopEnd: number;
  playbackEnd: number;
  wavetablePosition: number;
  // Volume envelope
  volumeEnvelopeAmount: number;
  volumeEnvelopeAttack: number;
  volumeEnvelopeDecay: number;
  volumeEnvelopeSustain: number;
  volumeEnvelopeRelease: number;
  // Volume automation
  volumeAutomationType: number;
  volumeAutomationEnabled: boolean;
  // Panning envelope
  panningEnvelopeAmount: number;
  panningEnvelopeAttack: number;
  panningEnvelopeDecay: number;
  panningEnvelopeSustain: number;
  panningEnvelopeRelease: number;
  // Panning automation
  panningAutomationType: number;
  panningAutomationEnabled: boolean;
  // Cutoff envelope
  cutoffEnvelopeAmount: number;
  cutoffEnvelopeAttack: number;
  cutoffEnvelopeDecay: number;
  cutoffEnvelopeSustain: number;
  cutoffEnvelopeRelease: number;
  // Cutoff automation
  cutoffAutomationType: number;
  cutoffAutomationEnabled: boolean;
  // Wavetable position envelope
  wavetablePositionEnvelopeAmount: number;
  wavetablePositionEnvelopeAttack: number;
  wavetablePositionEnvelopeDecay: number;
  wavetablePositionEnvelopeSustain: number;
  wavetablePositionEnvelopeRelease: number;
  // Wavetable position automation
  wavetablePositionAutomationType: number;
  wavetablePositionAutomationEnabled: boolean;
  // Granular position envelope
  granularPositionEnvelopeAmount: number;
  granularPositionEnvelopeAttack: number;
  granularPositionEnvelopeDecay: number;
  granularPositionEnvelopeSustain: number;
  granularPositionEnvelopeRelease: number;
  // Granular position automation
  granularPositionAutomationType: number;
  granularPositionAutomationEnabled: boolean;
  // Finetune envelope
  finetuneEnvelopeAmount: number;
  finetuneEnvelopeAttack: number;
  finetuneEnvelopeDecay: number;
  finetuneEnvelopeSustain: number;
  finetuneEnvelopeRelease: number;
  // Finetune automation
  finetuneAutomationType: number;
  finetuneAutomationEnabled: boolean;
  // Volume automation LFO
  volumeLfoType: number;
  volumeLfoSteps: number;
  volumeLfoAmount: number;
  // Panning automation LFO
  panningLfoType: number;
  panningLfoSteps: number;
  panningLfoAmount: number;
  // Cutoff automation LFO
  cutoffLfoType: number;
  cutoffLfoSteps: number;
  cutoffLfoAmount: number;
  // Wavetable position automation LFO
  wavetablePositionLfoType: number;
  wavetablePositionLfoSteps: number;
  wavetablePositionLfoAmount: number;
  // Granular position automation LFO
  granularPositionLfoType: number;
  granularPositionLfoSteps: number;
  granularPositionLfoAmount: number;
  // Finetune automation LFO
  finetuneLfoType: number;
  finetuneLfoSteps: number;
  finetuneLfoAmount: number;
  // Filter
  filterCutoff: number;
  filterResonance: number;
  filterType: FilterTypeType;
  filterEnabled: boolean;
  // Instrument parameters
  tune: number;
  finetune: number;
  volume: number;
  panning: number;
  // Effects
  delaySend: number;
  // Slices
  slices: number[];
  totalSlices: number;
  activeSlice: number;
  // Granular
  granularLength: number;
  granularPosition: number;
  granularShape: GranularShapeType;
  granularLoopMode: GranularLoopModeType;
  // More effects
  reverbSend: number;
  overdrive: number;
  bitDepth: number;
};

export const HeaderFieldOffset: Readonly<{
  [key in keyof HeaderData]: number;
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
} as const;

const asciiDecoder: TextDecoder = new TextDecoder("ascii");

/**
 * Parse a .pti file header
 */
export function parseHeader(header: ArrayBufferLike): HeaderData {
  const view = new DataView(header);
  const headerData: HeaderData = {} as HeaderData;
  (Object.entries(HeaderFieldOffset) as [keyof HeaderData, number][]).forEach(
    ([field, offset]) => {
      switch (field) {
        case "isWavetable":
        case "volumeAutomationEnabled":
        case "panningAutomationEnabled":
        case "cutoffAutomationEnabled":
        case "wavetablePositionAutomationEnabled":
        case "granularPositionAutomationEnabled":
        case "finetuneAutomationEnabled":
        case "filterEnabled":
          headerData[field] = view.getUint8(offset) === 1;
          break;
        case "instrumentName":
          headerData[field] = asciiDecoder
            .decode(new Uint8Array(header, offset, 31))
            .replaceAll("\x00", "");
          break;
        case "slices":
          headerData[field] = Array(48)
            .fill(0)
            .map((_, i) => view.getUint16(offset + i * 2, true) / 65535);
          break;
        case "wavetableWindowSize":
          headerData[field] = view.getUint16(offset, true);
          break;
        default:
          const value = view.getUint8(offset);
          switch (field) {
            case "samplePlayback":
              headerData[field] = (
                Object.values(SamplePlayback) as number[]
              ).includes(value)
                ? (value as SamplePlaybackType)
                : SamplePlayback.ONE_SHOT;
              break;
            case "granularShape":
              headerData[field] = (
                Object.values(GranularShape) as number[]
              ).includes(value)
                ? (value as GranularShapeType)
                : GranularShape.SQUARE;
              break;
            case "granularLoopMode":
              headerData[field] = (
                Object.values(GranularLoopMode) as number[]
              ).includes(value)
                ? (value as GranularLoopModeType)
                : GranularLoopMode.FORWARD;
              break;
            case "filterType":
              headerData[field] = (
                Object.values(FilterType) as number[]
              ).includes(value)
                ? (value as FilterTypeType)
                : FilterType.LOW_PASS;
              break;
            default:
              headerData[field] = value;
              break;
          }
      }
    }
  );

  headerData.slices.splice(headerData.totalSlices);

  return headerData;
}

const PTI_MAGIC_BYTES = new Uint8Array([
  84, 73, 1, 0, 1, 5, 0, 1, 9, 9, 9, 9, 116, 1, 0, 0, 1, 0, 0, 0,
]);

const PTI_HEADER = (() => {
  const header = new ArrayBuffer(392);
  // Copy the magic bytes
  new Uint8Array(header).set(PTI_MAGIC_BYTES);
  const view = new DataView(header);

  // Set the defaults
  view.setInt16(HeaderFieldOffset.wavetableWindowSize, 2048, true);
  view.setInt16(80, 1, true); // Loop start
  view.setInt16(82, 65534, true); // Loop end
  view.setInt16(84, 65535, true); // Playback end
  // Volume automation
  view.setFloat32(92, 1.0, true); // Amount
  view.setFloat32(104, 1.0, true); // Sustain
  view.setUint16(108, 1000, true); // Release
  view.setUint8(111, 1); // Envelope
  view.setUint8(212, 2); // LFO type
  view.setFloat32(216, 0.5, true); // LFO Amount
  // Panning automation
  view.setFloat32(112, 1.0, true); // Amount
  view.setFloat32(124, 1.0, true); // Sustain
  view.setInt16(128, 1000, true); // Release
  view.setUint8(220, 2); // LFO type
  view.setFloat32(224, 0.5, true); // LFO Amount
  // Cutoff automation
  view.setFloat32(132, 1.0, true); // Amount
  view.setFloat32(144, 1.0, true); // Sustain
  view.setInt16(148, 1000, true); // Release
  view.setUint8(228, 2); // LFO type
  view.setFloat32(232, 0.5, true); // LFO Amount
  // Wavetable position automation
  view.setFloat32(152, 1.0, true); // Amount
  view.setFloat32(164, 1.0, true); // Sustain
  view.setInt16(168, 1000, true); // Release
  view.setUint8(236, 2); // LFO type
  view.setFloat32(240, 0.5, true); // LFO Amount
  // Granular position automation
  view.setFloat32(172, 1.0, true); // Amount
  view.setFloat32(184, 1.0, true); // Sustain
  view.setInt16(188, 1000, true); // Release
  view.setUint8(244, 2); // LFO type
  view.setFloat32(248, 0.5, true); // LFO Amount
  // Finetune automation
  view.setFloat32(192, 1.0, true); // Amount
  view.setFloat32(204, 1.0, true); // Sustain
  view.setInt16(208, 1000, true); // Release
  view.setUint8(252, 2); // LFO type
  view.setFloat32(256, 0.5, true); // LFO Amount
  // Filter
  view.setFloat32(260, 1.0, true); // Cutoff
  // Parameters
  view.setUint8(272, 50); // Volume
  view.setUint8(276, 50); // Panning
  // Granular
  view.setInt16(378, 441, true); // Granular length
  // Effects
  view.setUint8(386, 16); // Bit depth

  return header;
})();

export function createBeatSlicedPtiFromSamples(audio : Float32Array[]) {
  const mergedAudio = mergeFloat32Arrays(audio);
  const totalLength = mergedAudio.length;

  const buffer = getPtiFile(mergedAudio);

  const view = new DataView(buffer);
  view.setUint8(HeaderFieldOffset.samplePlayback, SamplePlayback.BEAT_SLICE)
  view.setUint8(HeaderFieldOffset.totalSlices, audio.length);

  let offset = 0;
  for (const [idx, slice] of audio.entries()) {
    view.setUint16(HeaderFieldOffset.slices + idx * 2, (offset / totalLength) * 65535, true)
    offset += slice.length;
  }
  return buffer;
}

export function getPtiFile(data: Float32Array) {
  // Calculate the number of bytes in the audio data
  const length = data.length * Int16Array.BYTES_PER_ELEMENT;
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(PTI_HEADER.byteLength + length);
  // Write the default PTI header to the buffer
  new Uint8Array(buffer).set(new Uint8Array(PTI_HEADER));
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(HeaderFieldOffset.sampleLength, length, true);
  // Write the audio data to the buffer (converting from float to 16 bit PCM)
  new Int16Array(buffer, PTI_HEADER.byteLength).set(float32ToInt16(data));
  return buffer;
}
