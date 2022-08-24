<script setup lang="ts">
  import { computed } from "vue"

  import MessageItem from "@/components/messages/MessageItem.vue"

  import type { Message } from "@/stores/messages"
  import { useMessages } from "@/stores/messages"

  const store = useMessages()
  const { removeMessage } = store

  function dismissAll(level?: Message["level"]) {
    store.messages.forEach(
      (message) =>
        (level === undefined || message.level === level) &&
        removeMessage(message.id),
    )
  }

  const warning = computed(() =>
    store.messages.filter((message) => message.level === "warning"),
  )
  const error = computed(() =>
    store.messages.filter((message) => message.level === "error"),
  )
  const success = computed(() =>
    store.messages.filter((message) => message.level === "success"),
  )
  const info = computed(() =>
    store.messages.filter((message) => message.level === "info"),
  )
</script>

<template>
  <section role="log">
    <div
      v-for="[level, messages] in Object.entries({
        info,
        success,
        warning,
        error,
      })"
      :key="level"
      :class="['level', level]"
    >
      <TransitionGroup v-if="messages.length" name="list" tag="ul">
        <li v-for="message in messages" :key="message.id">
          <MessageItem :message="message" @remove="removeMessage(message.id)" />
        </li>
      </TransitionGroup>
      <button
        v-if="messages.length > 3"
        type="button"
        @click="() => dismissAll(level as Message['level'])"
      >
        <small>Dismiss {{ level }} messages</small>
      </button>
    </div>
  </section>
</template>

<style scoped>
  [role="log"] {
    position: relative;
  }

  .level {
    display: flex;
    flex-direction: column;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 2px 0;
  }

  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: opacity 0.5s linear, transform 0.5s ease-in-out, all 0.5s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .list-leave-to {
    height: 0;
  }

  .list-leave-active {
    position: absolute;
    left: 0;
    right: 0;
  }
</style>