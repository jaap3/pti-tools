<script setup lang="ts">
  import { computed } from "vue"

  import StyledFieldset from "@/components/base/StyledFieldset.vue"
  import { displayDuration } from "@/helpers/numberformat"
  import { shortenString } from "@/helpers/stringformat"

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
  :where(legend > span) {
    max-width: calc(100vw - 128px);
    margin-right: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :where(legend > time) {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
</style>
