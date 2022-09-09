import { acceptHMRUpdate, defineStore } from "pinia"
import { ref } from "vue"

export interface MessageOptions {
  id: string
  timeout: number | undefined
}

export type PartialMessageOptions = Partial<MessageOptions>

export interface Message extends MessageOptions {
  text: string
  level: "info" | "success" | "warning" | "error"
}

export const useMessages = defineStore("messages", () => {
  const messages = ref<Message[]>([])

  function addMessage(
    text: string,
    level: Message["level"],
    options?: PartialMessageOptions,
  ) {
    const id = options?.id ?? crypto.randomUUID()
    messages.value.push({
      id: id,
      text,
      level,
      timeout: options?.timeout,
    })
  }

  function removeMessage(id: string) {
    messages.value = messages.value.filter((message) => message.id !== id)
  }

  return {
    messages,
    addMessage,
    removeMessage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot))
}
