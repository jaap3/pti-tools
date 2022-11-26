<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import { computed } from "vue"

  import { checksum } from "@/helpers/checksum"
  import type { Layer, Slice } from "@/lib/app/types"
  import { useSlices } from "@/stores/slices"

  import AudioFileSelectItem from "./AudioFileSelectItem.vue"
  import AudioList from "./AudioList.vue"

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      onInput?: (file: Slice | Layer) => Promise<unknown>
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
  async function emitInput(file: Slice | Layer) {
    await props.onInput(file)
  }

  const slicesStore = useSlices()
  const { getLayers } = slicesStore
  const { slicesList } = storeToRefs(slicesStore)

  const audioFiles = computed(() => {
    const seen = new Set()
    const audioFiles = slicesList.value.map((slice) => {
      return [slice, getLayers(slice.id)].flat().filter((file) => {
        const key = `${file.name}|${file.duration}|${checksum(
          file.originalAudio,
        )}`
        return !seen.has(key) ? seen.add(key) && true : false
      })
    })
    return audioFiles.flat()
  })
</script>

<template>
  <AudioList class="collection" :can-collapse="true">
    <template #title>Sample library</template>
    <p>Duplicate audio from slices or layers</p>
    <ol v-if="audioFiles.length">
      <li v-for="file in audioFiles" :key="file.id">
        <AudioFileSelectItem :file="file" @input="emitInput" />
      </li>
    </ol>
  </AudioList>
</template>

<style scoped>
  p {
    margin: 0 8px 16px;
  }

  .collection {
    min-height: auto;
    max-height: 256px;
    margin-top: 16px;
    margin-bottom: -12px;
    background: var(--almost-black);
  }

  .collection :deep(ol) {
    gap: 8px;
  }
</style>
