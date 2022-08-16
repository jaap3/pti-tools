import { float32ToInt16, mergeFloat32Arrays } from "../audio-tools";

import type {
  HeaderData,
  SamplePlayback,
  GranularLoopMode,
  GranularShape,
  FilterType,
} from "./types";
import {
  defaultPtiHeader,
  samplePlayback,
  granularShape,
  granularLoopMode,
  filterType,
  headerFieldOffset,
} from "./constants";

export function parseHeader(header: ArrayBufferLike): HeaderData {
  /**
   * Parse a .pti file header
   */
  const view = new DataView(header);
  const headerData: HeaderData = {} as HeaderData;
  (Object.entries(headerFieldOffset) as [keyof HeaderData, number][]).forEach(
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
                Object.values(samplePlayback) as number[]
              ).includes(value)
                ? (value as SamplePlayback)
                : samplePlayback.ONE_SHOT;
              break;
            case "granularShape":
              headerData[field] = (
                Object.values(granularShape) as number[]
              ).includes(value)
                ? (value as GranularShape)
                : granularShape.SQUARE;
              break;
            case "granularLoopMode":
              headerData[field] = (
                Object.values(granularLoopMode) as number[]
              ).includes(value)
                ? (value as GranularLoopMode)
                : granularLoopMode.FORWARD;
              break;
            case "filterType":
              headerData[field] = (
                Object.values(filterType) as number[]
              ).includes(value)
                ? (value as FilterType)
                : filterType.LOW_PASS;
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

const asciiDecoder: TextDecoder = new TextDecoder("ascii");

export function createBeatSlicedPtiFromSamples(audio: Float32Array[]) {
  const mergedAudio = mergeFloat32Arrays(audio);
  const totalLength = mergedAudio.length;

  const buffer = getPtiFile(mergedAudio);

  const view = new DataView(buffer);
  view.setUint8(headerFieldOffset.samplePlayback, samplePlayback.BEAT_SLICE);
  view.setUint8(headerFieldOffset.totalSlices, audio.length);

  let offset = 0;
  for (const [idx, slice] of audio.entries()) {
    view.setUint16(
      headerFieldOffset.slices + idx * 2,
      (offset / totalLength) * 65535,
      true
    );
    offset += slice.length;
  }
  return buffer;
}

export function getPtiFile(data: Float32Array) {
  // Calculate the number of bytes in the audio data
  const length = data.length * Int16Array.BYTES_PER_ELEMENT;
  // Create a buffer to hold the wave file data
  const buffer = new ArrayBuffer(defaultPtiHeader.byteLength + length);
  // Write the default PTI header to the buffer
  new Uint8Array(buffer).set(new Uint8Array(defaultPtiHeader));
  // Update the data length field in the WAV header
  new DataView(buffer).setUint32(headerFieldOffset.sampleLength, length, true);
  // Write the audio data to the buffer (converting from float to 16 bit PCM)
  new Int16Array(buffer, defaultPtiHeader.byteLength).set(float32ToInt16(data));
  return buffer;
}

export { HeaderData, samplePlayback };
