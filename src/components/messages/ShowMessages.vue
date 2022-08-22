<script setup lang="ts">
  import MessageItem from "@/components/messages/MessageItem.vue"

  import { useMessages } from "@/stores/messages"

  const store = useMessages()
  const { removeMessage } = store

  function dismissAll() {
    store.messages.forEach((message) => removeMessage(message.id))
  }
</script>

<template>
  <div role="log">
    <TransitionGroup name="list" tag="ul">
      <li v-for="message in store.messages" :key="message.id">
        <MessageItem :message="message" @remove="removeMessage(message.id)" />
      </li>
    </TransitionGroup>
  </div>
  <button v-if="store.messages.length" type="button" @click="dismissAll">
    <small>Dismiss all</small>
  </button>
</template>

<style scoped>
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
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
