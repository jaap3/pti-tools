import type { InjectionKey } from "vue"

export const AudioContextKey = Symbol() as InjectionKey<AudioContext>

export interface AudioFile {
  name: string
  audio: AudioBuffer
}
