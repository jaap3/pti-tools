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

  withDefaults(
    defineProps<{ name: string; truncateNameAt: number; duration: number }>(),
    { truncateNameAt: 25 },
  )
</script>

<template>
  <fieldset :title="`${name} - ${displayDuration(duration)}`">
    <legend>
      <span class="name">{{ shortenString(name, truncateNameAt) }}</span>
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
    margin: 0;
    overflow: hidden;
  }

  :is(legend) {
    display: flex;
    width: 100%;
    max-width: calc(100% - 16px);
    padding: 0 4px;
    margin: 0 auto;
    font-weight: 400;
    color: #000;
    background-color: #fff;
  }

  :is(legend span) {
    max-width: calc(100vw - 128px);
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :is(legend time) {
    margin-left: auto;
  }
</style>
