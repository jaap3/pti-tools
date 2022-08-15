import { readFileSync } from "fs";
import * as path from "path";

import { parseHeader, SamplePlayback } from "../src/pti-file-format";
import type { HeaderData } from "../src/pti-file-format";

function readPtiFile(fileName: string): ArrayBufferLike {
  return readFileSync(path.join(__dirname, "./pti-files/", fileName)).buffer;
}

function fakeSlices(n: number): number[] {
  return Array(n)
    .fill(0)
    .map((_, i) => Math.max(i / (n - 1) - 0.05, 0));
}

const expectations: [string, Partial<HeaderData>][] = [
  [
    "Drum Kits/80s 21p.pti",
    {
      instrumentName: "80s 21p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 21,
      activeSlice: 20,
      slices: fakeSlices(21),
    },
  ],
  [
    "Drum Kits/Acid 33p.pti",
    {
      instrumentName: "Acid 33p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 33,
      activeSlice: 32,
      slices: fakeSlices(33),
    },
  ],
  [
    "Drum Kits/Analog 2 20p.pti",
    {
      instrumentName: "Analog 2 20p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 20,
      activeSlice: 19,
      slices: fakeSlices(20),
    },
  ],
  [
    "Drum Kits/Analog 3 18p.pti",
    {
      instrumentName: "Analog 3 18p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 18,
      activeSlice: 17,
      slices: fakeSlices(18),
    },
  ],
  [
    "Drum Kits/Analog 4 19p.pti",
    {
      instrumentName: "Analog 4 19p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 19,
      activeSlice: 18,
      slices: fakeSlices(19),
    },
  ],
  [
    "Drum Kits/Analog 20p.pti",
    {
      instrumentName: "Analog 20p",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 20,
      activeSlice: 19,
      slices: fakeSlices(20),
    },
  ],
  [
    "Drum Kits/Bells.pti",
    {
      instrumentName: "bells",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 0,
      slices: [
        // Some long slices and some shorter ones
        0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.62, 0.72, 0.8, 0.82, 0.84,
        0.86, 0.9, 0.95,
      ],
    },
  ],
  [
    "Drum Kits/Bells2.pti",
    {
      instrumentName: "bells2",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 13,
      // Pretty much as if there were 21 slices, but some slices are longer
      slices: fakeSlices(21).filter((_, i) => ![7, 8, 9, 12, 13].includes(i)),
    },
  ],
  [
    "Drum Kits/Hiphop1.pti",
    {
      instrumentName: "hh3",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 1,
      // Nudge slices starting with slice 8 a little bit
      slices: fakeSlices(16).map((s, i) => (i >= 8 ? s + 0.05 : s)),
    },
  ],
  [
    "Drum Kits/Hiphop2.pti",
    {
      instrumentName: "hh2",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 18,
      activeSlice: 14,
      // Nude slices 2-8 forwards a bit, slice 13-18 backwards a bit
      slices: fakeSlices(18).map((s, i) =>
        i >= 2 && i < 8 ? s + 0.05 : i >= 13 ? s - 0.05 : s
      ),
    },
  ],
  [
    "Drum Kits/Hiphop3.pti",
    {
      instrumentName: "hh1",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 17,
      activeSlice: 11,
      // As if there were 30 slices, but one slice is really long compared to the others
      slices: fakeSlices(30).filter(
        (_, i) =>
          ![4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 28].includes(i)
      ),
    },
  ],
  [
    "Drum Kits/Hiphop4.pti",
    {
      instrumentName: "hh4",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 8,
      slices: fakeSlices(25).filter(
        (_, i) => ![4, 5, 6, 7, 8, 12, 15, 17, 19].includes(i)
      ),
    },
  ],
  [
    "Drum Kits/Hiphop5.pti",
    {
      instrumentName: "hh5",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 10,
      slices: [
        0,
        0.06,
        0.12,
        0.18,
        0.2,
        0.22,
        0.28,
        0.3,
        0.38,
        0.42,
        10 / 16,
        11 / 16,
        12 / 16,
        13 / 16,
        14 / 16,
        15 / 16,
      ],
    },
  ],
  [
    "Drum Kits/Hiphop6.pti",
    {
      instrumentName: "hh6",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 0,
      slices: [
        0, 0.04, 0.08, 0.1, 0.12, 0.14, 0.58, 0.6, 0.64, 0.68, 0.74, 0.84, 0.86,
        0.88, 0.9, 0.95,
      ],
    },
  ],
  [
    "Drum Kits/Hiphop7.pti",
    {
      instrumentName: "hh7",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 15,
      activeSlice: 0,
      slices: fakeSlices(15),
    },
  ],
  [
    "Drum Kits/Hiphop8.pti",
    {
      instrumentName: "hh8",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 0,
      slices: fakeSlices(16).map((s, i) => (i >= 4 ? s + 0.05 : s)),
    },
  ],
  [
    "Drum Kits/Hiphop9.pti",
    {
      instrumentName: "hh9",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 16,
      activeSlice: 0,
      slices: fakeSlices(16),
    },
  ],
  [
    "Drum Kits/Perc1.pti",
    {
      instrumentName: "perc1",
      samplePlayback: SamplePlayback.BEAT_SLICE,
      totalSlices: 14,
      activeSlice: 0,
      slices: [
        0, 0.12, 0.15, 0.27, 0.3, 0.36, 0.38, 0.4, 0.44, 0.62, 0.68, 0.72, 0.76,
        0.83,
      ],
    },
  ],
];

describe.each(expectations)(`parseHeader %s`, (filename, expected) => {
  const headerData = parseHeader(readPtiFile(filename));
  const expectedSlices = (expected.slices || [0]).map((value, i) => [i, value]);
  delete expected.slices;

  test.each(
    Object.entries(expected) as {
      [K in keyof HeaderData]: [K, HeaderData[K]];
    }[keyof HeaderData][]
  )("headerData.%s = %s", (key, value) => {
    expect(headerData[key]).toBe(value);
  });

  test(`headerData.slices.length = ${expectedSlices.length}`, () =>
    expect(headerData.slices.length).toBe(expectedSlices.length));

  test.each(expectedSlices)("headerData.slices[%i] = %s", (i, value) => {
    expect(headerData.slices[i]).toBeCloseTo(value, 1);
  });
});
