/**
 * Shorten the given text the requested number of characters, keeping the
 * first and last characters and replacing the middle with an ellipsis.
 * @param str - The string to shorten.
 * @param maxLength - The maximum length of the string.
 * @returns The shortened string.
 */
export function shortenString(str: string, maxLength: number): string {
  const { length } = str
  if (length <= maxLength) return str
  const halfLength = Math.floor(maxLength / 2)
  return str.substring(0, halfLength) + "…" + str.substring(length - halfLength)
}
