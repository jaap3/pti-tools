<script setup lang="ts">
  import { computed } from "vue"

  import StyledFieldset from "@/components/base/StyledFieldset.vue"
  import { displayDuration } from "@/helpers/numberformat"

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
  <StyledFieldset :title="`${name} - ${formattedDuration}`">
    <template #legend>
      <span class="name">{{ shortenString(name, props.truncateNameAt) }}</span>
      <time :datetime="duration.toFixed(3)">{{ formattedDuration }}</time>
    </template>
    <slot />
  </StyledFieldset>
</template>

<style scoped>
  :is(legend span) {
    max-width: calc(100vw - 128px);
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :is(legend time) {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
</style>
