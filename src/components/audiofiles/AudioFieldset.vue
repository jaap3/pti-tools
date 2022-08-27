<script setup lang="ts">
  import { displayDuration } from "@/audio-tools/numberformat"

  function shortenString(str: string, maxLength: number) {
    const { length } = str
    if (length <= maxLength) return str
    const halfLength = Math.floor(maxLength / 2)
    return (
      str.substring(0, halfLength) + "…" + str.substring(length - halfLength)
    )
  }

  defineProps<{ name: string; duration: number }>()
</script>

<template>
  <fieldset :title="`${name} - ${displayDuration(duration)}`">
    <legend>
      <span class="name">{{ shortenString(name, 25) }}</span>
      <time :datetime="duration.toFixed(3)">{{
        displayDuration(duration)
      }}</time>
    </legend>
    <slot />
  </fieldset>
</template>

<style scoped>
  :is(fieldset) {
    padding: 8px 0 0;
    overflow: hidden;
  }

  :is(legend) {
    display: flex;
    width: 100%;
    margin: 0 auto;
    padding: 0 4px;
    background-color: #fff;
    color: #000;
    font-weight: 400;
    max-width: calc(100% - 16px);
  }

  :is(legend span) {
    margin-right: auto;
    overflow: hidden;
    white-space: nowrap;
    margin-right: 4px;
  }

  :is(legend time) {
    margin-left: auto;
  }
</style>
