interface BaseMessage {
  text: string,
  level: string
}

export interface MessageOptions {
  id: string
  timeout: number | undefined
}

export type ErrorMessageLevel = "error" | "warning"

export type MessageLevel = "info" | "success" | ErrorMessageLevel

export interface Message extends BaseMessage, MessageOptions {
  level: MessageLevel
}

export interface ErrorMessage extends BaseMessage {
  level: ErrorMessageLevel
  isError: true
}

export type TrimOption = "none" | "start" | "end" | "both"

interface AudioFileOptions {
  trim: TrimOption
  gain: number // Gain in dB.
}

export interface AudioFile {
  name: string
  audio: Float32Array
  duration: number
}

export interface EditableAudioFile extends AudioFile {
  id: string
  originalAudio: Float32Array
  options: AudioFileOptions
}

export interface Slice extends EditableAudioFile {}

export interface Layer extends EditableAudioFile {
  sliceId: Slice["id"]
}
