import { acceptHMRUpdate, defineStore } from "pinia"
import { ref } from "vue"

import type { Message, MessageOptions } from "@/lib/app/types"

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
    options?: Partial<MessageOptions>,
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
  // Using as any to workaround https://github.com/vuejs/pinia/issues/2098
  import.meta.hot.accept(acceptHMRUpdate(useMessages as any, import.meta.hot))
}
