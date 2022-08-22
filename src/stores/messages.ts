import { defineStore, acceptHMRUpdate } from "pinia"
import { ref } from "vue"
import type { Message } from "@/types"

export const useMessages = defineStore("messages", () => {
  const messages = ref<Message[]>([])

  function addMessage(text: string, level: Message["level"]) {
    messages.value.push({
      id: crypto.randomUUID(),
      text,
      level,
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
