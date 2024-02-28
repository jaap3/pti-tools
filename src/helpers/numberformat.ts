/**
 * Converts a number representing a duration in seconds to a string
 * denoting the number of milliseconds or seconds as appropriate.
 *
 * If the number of seconds is less than 1, the result is a string
 * denoting the number of milliseconds (e.g. "123ms").
 * Otherwise, the result is a string denoting the number of seconds
 * with millisecond precision (e.g. "1.234s", no rounding is performed).
 * @param seconds - The duration of in seconds.
 * @returns A string denoting the duration.
 */
export function displayDuration(seconds: number): string {
  return seconds < 1
    ? `${(seconds * 1000).toFixed()}ms`
    : `${seconds.toFixed(3)}s`
}
