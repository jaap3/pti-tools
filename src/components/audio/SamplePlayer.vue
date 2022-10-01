<script setup lang="ts">
  import { computed, ref } from "vue"

  import ControlsHolder from "@/components/base/ControlsHolder.vue"
  import { useAudioContext } from "@/stores/audiocontext"

  import ButtonControl from "./ButtonControl.vue"
  import SampleWaveform from "./SampleWaveform.vue"

  const { ctx, stopPlayback, getAudioBufferSourceNode } = useAudioContext()

  const props = withDefaults(
    defineProps<{
      audio: Float32Array
      name: string
      showWaveform?: boolean
    }>(),
    { showWaveform: true },
  )

  const isPlaying = ref<boolean>(false)

  const buttonTitle = computed(() => {
    return isPlaying.value
      ? `Stop playing "${props.name}"`
      : `Play "${props.name}"`
  })

  const buttonIcon = computed(() => {
    return isPlaying.value ? "stop" : "play_arrow"
  })

  /**
   * Plays the audio file. Any other playing audio file is stopped.
   */
  function play() {
    isPlaying.value = true
    const source = getAudioBufferSourceNode(props.audio)
    source.addEventListener("ended", () => (isPlaying.value = false))
    source.connect(ctx.destination)
    source.start(0)
  }

  /**
   * Stop the playback of any audio that has been started by this component.
   */
  function stop() {
    if (!isPlaying.value) return
    stopPlayback()
    isPlaying.value = false
  }

  /**
   * Toggle the playback of the audio file (i.e. play when stopped,
   * stop when playing).
   */
  function togglePlayback() {
    isPlaying.value ? stop() : play()
  }

  defineExpose({
    play,
    stop,
    isPlaying,
  })
</script>

<template>
  <SampleWaveform
    v-if="showWaveform"
    :audio="audio"
    :class="['waveform', $attrs['class']]"
    :title="`Play &quot;${name}&quot;`"
    @click="togglePlayback"
  />
  <ControlsHolder :class="$attrs['class']" title="">
    <ButtonControl
      :title="buttonTitle"
      :icon="buttonIcon"
      @click="togglePlayback"
    />
    <slot name="controls" />
  </ControlsHolder>
</template>

<style scoped>
  .waveform {
    cursor: pointer;
  }
</style>
