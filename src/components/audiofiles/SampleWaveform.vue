<script setup lang="ts">
  import { computed, onMounted, ref, watch } from "vue"

  const canvas = ref<HTMLCanvasElement | null>(null)

  const props = withDefaults(
    defineProps<{
      width?: number | null
      height?: number
      audio: Float32Array
    }>(),
    { height: 150, width: null },
  )

  const audioData = computed(() => {
    if (canvas.value === null) return null
    return props.audio
  })

  /**
   * Creates the rendering contexts and draws the waveform of the audio file.
   */
  function drawInstrument() {
    if (canvas.value == null || audioData.value === null) return

    const { ownerDocument: d, width, height } = canvas.value

    const offscreenCanvas = d.createElement("canvas")
    offscreenCanvas.width = width
    offscreenCanvas.height = height

    const ctx = canvas.value.getContext("2d", {
      alpha: false,
      desynchronized: true,
    }) as CanvasRenderingContext2D
    const offscreenCtx = offscreenCanvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    }) as CanvasRenderingContext2D

    // Draw waveform offscreen
    drawWaveform(offscreenCtx, props.audio, width, height)

    // Copy waveform to visible canvas
    ctx.drawImage(offscreenCanvas, 0, 0)
  }

  /**
   * Draws the waveform of the audio file.
   *
   * @param ctx - The canvas context.
   * @param buffer - The audio buffer.
   * @param width - The width of the canvas.
   * @param height - The height of the canvas.
   */
  function drawWaveform(
    ctx: CanvasRenderingContext2D,
    buffer: Float32Array,
    width: number,
    height: number,
  ) {
    const yScale = -height / 2
    const bufferLength = buffer.length

    ctx.save()

    ctx.fillStyle = "#0A0A0A"
    ctx.fillRect(0, 0, width, height)

    ctx.translate(0, -yScale)
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1

    ctx.beginPath()
    let x: number, y: number, prevY: number | undefined
    let skipped = false
    const samplesToDraw = Math.min(width * 100, bufferLength)
    for (let i = 0; i <= samplesToDraw; i++) {
      if (prevY === undefined) {
        ctx.moveTo(
          0,
          (prevY = Math.max(-1, Math.min(1, buffer[0] || 0)) * yScale),
        )
      } else {
        y =
          Math.max(
            -1,
            Math.min(
              1,
              buffer[Math.floor((i / samplesToDraw) * bufferLength)] || 0,
            ),
          ) * yScale
        if (y !== prevY || i === samplesToDraw) {
          x = (i / samplesToDraw) * width
          if (skipped) ctx.lineTo(x, prevY)
          ctx.lineTo(x, (prevY = y))
          skipped = false
        } else {
          skipped = true
        }
      }
    }
    ctx.stroke()

    ctx.resetTransform()
    ctx.restore()
  }

  onMounted(() => {
    const el = canvas.value
    if (!el) return
    el.height = props.height
    el.width = props.width || el.clientWidth || 300
  })

  let debounce: ReturnType<typeof requestAnimationFrame> | null = null
  watch(audioData, () => {
    if (debounce !== null) cancelAnimationFrame(debounce)
    debounce = requestAnimationFrame(() => {
      debounce = null
      drawInstrument()
    })
  })
</script>

<template>
  <canvas ref="canvas" />
</template>

<style scoped>
  canvas {
    display: block;
    width: 100%;
    border: 1px solid #0a0a0a;
  }
</style>
