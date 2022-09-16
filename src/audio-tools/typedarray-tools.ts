/**
 * Converts a Float32Array to a Int16Array. The values are scaled to fit in
 * the range of a signed 16-bit integer (i.e. [-32768, 32767]). The input
 * array is assumed to be in the range [-1, 1], values outside this range will
 * be clipped (i.e. -1.1 becomes -1, 1.1 becomes 1).
 *
 * @param data - The Float32Array to convert.
 * @returns A new Int16Array containing the data from the Float32Array
 *     scaled/clipped to fit in a 16-bit integer.
 */
export function float32ToInt16(data: Float32Array): Int16Array {
  return Int16Array.from(data, (v) =>
    v < 0 ? Math.max(-1, v) * 0x8000 : Math.min(v, 1) * 0x7fff,
  )
}
