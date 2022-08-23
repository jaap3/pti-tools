<script setup lang="ts">
  import type { AudioFile } from "@/stores/audiofiles"
  import { onMounted, ref, watch } from "vue"

  const canvas = ref<HTMLCanvasElement | null>(null)

  const props = defineProps<{
    file: AudioFile
  }>()

  function drawInstrument() {
    if (canvas.value === null) return

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
    drawWaveform(
      offscreenCtx,
      props.file.audio.getChannelData(0),
      width,
      height,
    )

    // Copy waveform to visible canvas
    ctx.drawImage(offscreenCanvas, 0, 0)
  }

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
        ctx.moveTo(0, (prevY = (buffer[0] || 0) * yScale))
      } else {
        y =
          (buffer[Math.floor((i / samplesToDraw) * bufferLength)] || 0) * yScale
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
    drawInstrument()
  })

  watch(props.file, () => {
    drawInstrument()
  })
</script>

<template>
  <canvas ref="canvas" />
</template>

<style scoped>
  canvas {
    display: block;
    height: 150px;
    width: 100%;
    border: 1px solid #0a0a0a;
  }
</style>
