export function mergeFloat32Arrays(arrays: Float32Array[]) {
  const length = arrays.reduce((sum, array) => sum + array.length, 0)
  const result = new Float32Array(length)
  let offset = 0
  for (const array of arrays) {
    result.set(array, offset)
    offset += array.length
  }
  return result
}

export function float32ToInt16(data: Float32Array) {
  return Int16Array.from(data, (v) => (v < 0 ? v * 0x8000 : v * 0x7fff))
}
