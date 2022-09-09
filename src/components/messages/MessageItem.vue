<script setup lang="ts">
  import { onMounted } from "vue"

  import type { Message } from "@/stores/messages"

  const props = defineProps<{ message: Message }>()

  const emit = defineEmits<{
    (e: "remove"): void
  }>()

  onMounted(() => {
    const { timeout } = props.message
    if (timeout ?? -1 > 0) {
      setTimeout(() => {
        emit("remove")
      }, timeout)
    }
  })
</script>

<template>
  <div :class="['message', message.level]">
    <span class="message-type">
      {{ message.level }}
    </span>
    <span class="message-text">{{ message.text }}</span>
    <button class="material-icons message-remove" @click="emit('remove')">
      close
    </button>
  </div>
</template>

<style scoped>
  .message {
    display: flex;
    padding: 8px;
  }

  .error {
    color: #4f393d;
    background: #ffafc0;
    border: 1px solid #4f393d;
  }

  .warning {
    color: #4f4e39;
    background: #ffffaf;
    border: 1px solid #4f4e39;
  }

  .success {
    color: #4f4e39;
    background: #c3ffaf;
    border: 1px solid #4f4e39;
  }

  .info {
    color: #39464e;
    background: #afe0ff;
    border: 1px solid #39464e;
  }

  .message-type {
    display: inline-block;
    margin-right: 6px;
    font-weight: 400;
  }

  .message-remove {
    display: inline-block;
    margin-left: auto;
    font-size: 1rem;
    vertical-align: middle;
    cursor: pointer;
    background: none;
    border: none;
  }
</style>
