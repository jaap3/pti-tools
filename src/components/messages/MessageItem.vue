<script setup lang="ts">
  import { onMounted } from "vue"
  import { Message } from "@/types"

  defineProps<{ message: Message }>()

  const emit = defineEmits<{
    (e: "remove"): void
  }>()
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
    padding: 8px 8px;
  }
  .error {
    background: #ffafc0;
    color: #4f393d;
    border: 1px solid #4f393d;
  }

  .warning {
    background: #ffffaf;
    color: #4f4e39;
    border: 1px solid #4f4e39;
  }

  .success {
    background: #c3ffaf;
    color: #4f4e39;
    border: 1px solid #4f4e39;
  }

  .info {
    background: #afe0ff;
    color: #39464e;
    border: 1px solid #39464e;
  }

  .message-type {
    display: inline-block;
    font-weight: bold;
    margin-right: 6px;
  }

  .message-remove {
    border: none;
    background: none;
    display: inline-block;
    cursor: pointer;
    vertical-align: middle;
    margin-left: auto;
    font-size: 1rem;
  }
</style>
