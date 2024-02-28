import adler32 from "adler-32"

const cache = new WeakMap<ArrayBufferLike, number>()

/**
 * Calculate the checksum of a buffer
 * @param buffer The input buffer
 * @returns The checksum of the buffer as a number
 */
export function checksum(buffer: ArrayBufferLike): number {
  const value = cache.get(buffer) ?? adler32.buf(new Uint8Array(buffer))
  cache.set(buffer, value)
  return value
}
