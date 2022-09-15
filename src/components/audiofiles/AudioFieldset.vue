<script setup lang="ts">
  import { computed } from "vue"

  import { displayDuration } from "@/audio-tools/numberformat"

  /**
   * Shorten the given text the requested number of characters, keeping the
   * first and last characters and replacing the middle with an ellipsis.
   *
   * @param str - The string to shorten.
   * @param maxLength - The maximum length of the string.
   * @returns The shortened string.
   */
  function shortenString(str: string, maxLength: number): string {
    const { length } = str
    if (length <= maxLength) return str
    const halfLength = Math.floor(maxLength / 2)
    return (
      str.substring(0, halfLength) + "…" + str.substring(length - halfLength)
    )
  }

  const props = withDefaults(
    defineProps<{ name: string; truncateNameAt?: number; duration: number }>(),
    { truncateNameAt: 22 },
  )

  const formattedDuration = computed(() => displayDuration(props.duration))
</script>

<template>
  <fieldset :title="`${name} - ${formattedDuration}`">
    <legend>
      <span class="name">{{ shortenString(name, props.truncateNameAt) }}</span>
      <time :datetime="duration.toFixed(3)">{{ formattedDuration }}</time>
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
