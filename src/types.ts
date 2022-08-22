import type { InjectionKey } from "vue"

export interface Message {
  id: string
  text: string
  level: "info" | "success" | "warning" | "error"
}

export const AudioContextKey = Symbol() as InjectionKey<AudioContext>

export interface AudioFile {
  name: string
  audio: AudioBuffer
}
