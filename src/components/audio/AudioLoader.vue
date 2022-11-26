<script setup lang="ts">
  import AudioFileInput from "@/components/audio/AudioFileInput.vue"
  import AudioFileSelect from "@/components/audio/AudioFileSelect.vue"
  import type { Layer, Slice } from "@/lib/app/types"

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      onInput?: (file: File | Slice | Layer) => Promise<unknown>
    }>(),
    {
      disabled: false,
      onInput: async () => null,
    },
  )

  /**
   * Emits an input event with the given file
   *
   * @param file - The file to emit.
   */
  async function emitInput(file: File | Slice | Layer) {
    await props.onInput(file)
  }
</script>

<template>
  <AudioFileSelect :disabled="props.disabled" @input="emitInput" />
  <AudioFileInput
    :disabled="props.disabled"
    class="file-input"
    @input="emitInput"
  />
</template>
