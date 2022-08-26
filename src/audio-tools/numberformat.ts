export function displayDuration(duration: number) {
  return duration < 1
    ? `${(duration * 1000).toFixed()}ms`
    : `${duration.toFixed(3)}s`
}
