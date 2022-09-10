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

  /**
   * Adds a message to the store.
   *
   * @param text - The message text.
   * @param level - The message level (one of "info", "success", "warning", or "error").
   * @param options - Additional options (id and/or timeout).
   */
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

  /**
   * Removes a message from the store.
   *
   * @param id - The message id.
   */
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
