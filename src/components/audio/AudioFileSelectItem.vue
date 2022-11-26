<script setup lang="ts">
  import { computed, ref } from "vue"

  import { displayDuration } from "@/helpers/numberformat"
  import { shortenString } from "@/helpers/stringformat"
  import type { Layer, Slice } from "@/lib/app/types"

  import ButtonControl from "./ButtonControl.vue"
  import SamplePlayer from "./SamplePlayer.vue"

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      onInput?: (file: Slice | Layer) => Promise<unknown>
      file: Slice | Layer
    }>(),
    {
      disabled: false,
      onInput: async () => null,
    },
  )

  const formattedDuration = computed(() => displayDuration(props.file.duration))
  const samplePlayer = ref<InstanceType<typeof SamplePlayer> | null>(null)

  /**
   * Emits an input event with the given file
   *
   * @param file - The file to emit.
   */
  async function emitInput(file: Slice | Layer) {
    await props.onInput(file)
  }
</script>

<template>
  <div class="item">
    <div
      class="info"
      :title="`${file.name} - ${formattedDuration}`"
      @click="samplePlayer?.play()"
    >
      <div class="name">{{ shortenString(file.name, 15) }}</div>
      <time :datetime="file.duration.toFixed(3)">{{ formattedDuration }}</time>
    </div>
    <SamplePlayer
      ref="samplePlayer"
      :audio="file.audio"
      :name="file.name"
      :show-waveform="false"
      class="player"
    >
      <template #controls>
        <ButtonControl
          :title="`Insert &quot;${file.name}&quot;`"
          icon="library_add"
          @click="emitInput(file)"
        ></ButtonControl>
      </template>
    </SamplePlayer>
  </div>
</template>

<style scoped>
  .item {
    display: flex;
    align-items: center;
    width: 302px;
    padding-left: 8px;
    background-color: var(--near-black);
  }

  .info {
    display: flex;
    flex-grow: 1;
    gap: 8px;
  }

  .info > time {
    margin-left: auto;
  }

  :deep(.player) {
    flex-shrink: 1;
  }
</style>
