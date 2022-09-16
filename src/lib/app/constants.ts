export const sampleRate = 44100 // Hz

export const maxSlices = 48 // The Tracker can handle up to 48 slices (it has 48 pads).

// The recommended upper limit for an AudioBuffer is 45s.
// > Objects of these types are designed to hold small audio snippets, typically
// > less than 45 s
// > https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
// On the Tracker, according to the documentation
// > The longest recorded audio file can be 30 seconds long max.
// and:
// > The per-project memory is 133 seconds of mono samples.
// So 45s seems like a reasonable upper limit, as it *might* be possible to
// load a 45s sample into the Tracker. I have not tried this.
export const maxDuration = 45

// There's no real reason to limit the number of layers. Twelve seems to
// work well, though.
export const maxLayers = 12
