<script setup lang="ts">
  import { computed, watch } from "vue"
  import { storeToRefs } from "pinia"
  import { useMessages } from "@/stores/messages"
  import { useSlices } from "@/stores/slices"

  const messagesStore = useMessages()
  const slicesStore = useSlices()

  const sizeThreshold = 1024 * 1024 * 10 // 10MB

  const { maxSlices, maxDuration } = slicesStore
  const { maxSlicesReached, totalDuration, durationExceeded } =
    storeToRefs(slicesStore)

  const fileLoaderDisabled = computed(
    () => maxSlicesReached.value || durationExceeded.value,
  )

  watch(
    maxSlicesReached,
    (newValue) => {
      messagesStore.removeMessage("max-slices-reached")
      if (newValue) {
        messagesStore.addMessage(
          `Max. files reached (${maxSlices}): Remove a file to enable the file loader.`,
          "info",
          { id: "max-slices-reached" },
        )
      }
    },
    { immediate: true },
  )

  watch(
    durationExceeded,
    (newValue) => {
      messagesStore.removeMessage("duration-exceeded")
      if (newValue) {
        messagesStore.addMessage(
          `Total duration exceeds ${maxDuration} (${totalDuration.value.toFixed(
            3,
          )}s): Remove one or more files to enable the file loader.`,
          "info",
          { id: "duration-exceeded" },
        )
      }
    },
    { immediate: true },
  )

  function displayBytes(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  async function loadFile(file: File) {
    if (file.size > sizeThreshold) {
      messagesStore.addMessage(
        `Rejected "${file.name}", too large (>${displayBytes(sizeThreshold)}).`,
        "warning",
        { timeout: 8500 },
      )
      return
    }
    await slicesStore.addSlice(file)
  }

  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    for (const file of Array.from(input.files ?? [])) {
      if (fileLoaderDisabled.value) break
      await loadFile(file)
    }
  }

  function handleDragOver(evt: DragEvent) {
    evt.preventDefault()
    if (!evt.dataTransfer) return
    evt.dataTransfer.dropEffect = "copy"
  }

  /* Make sure eslint knows about the FileSystem API */
  /* global FileSystemEntry, FileSystemDirectoryEntry, FileSystemFileEntry */
  async function collectFiles(entry: FileSystemEntry) {
    if (fileLoaderDisabled.value) return
    if (entry.isFile) {
      const resolvedEntry: Promise<File> = new Promise((resolve, reject) => {
        ;(entry as FileSystemFileEntry).file(resolve, reject)
      })
      await loadFile(await resolvedEntry)
    } else if (entry.isDirectory) {
      // Recurse into directories
      const resolvedEntries: Promise<FileSystemEntry[]> = new Promise(
        (resolve, reject) => {
          const reader = (entry as FileSystemDirectoryEntry).createReader()
          reader.readEntries(resolve, reject)
        },
      )
      const entries = Array.from(await resolvedEntries).sort((a, b) => {
        // Files first, then directories
        if (a.isFile && !b.isFile) return -1
        if (b.isFile && !a.isFile) return 1
        // Sort alphabetically
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()
        if (aName < bName) return -1
        if (aName > bName) return 1
        return 0
      })
      for (const entry of entries) {
        if (fileLoaderDisabled.value) break
        await collectFiles(entry)
      }
    }
  }

  async function handleDrop(evt: DragEvent) {
    evt.preventDefault()
    if (fileLoaderDisabled.value) return
    if (!evt.dataTransfer) return
    const items = evt.dataTransfer.items
    for (const item of Array.from(items)) {
      if (fileLoaderDisabled.value) break
      if (item.kind === "file") {
        // Even though it's prefixed with "webkit" most browsers support it.
        const entry = item.webkitGetAsEntry()
        if (entry) await collectFiles(entry)
      }
    }
  }
</script>

<template>
  <label @dragover="handleDragOver" @drop="handleDrop">
    Choose / drop audio file(s) / folders
    <small
      >(<code>.wav</code>,&nbsp;<code>.mp3</code>,&nbsp;<code>.flac</code>,
      etc.)</small
    >
    <input
      multiple
      type="file"
      accept="audio/*"
      :disabled="fileLoaderDisabled"
      @input="handleInput"
    />
  </label>
</template>

<style scoped>
  label {
    display: block;
    position: relative;
    width: 100%;
    outline: 1px dashed #fffefe;
    background: #0a0a0a;
    border-radius: 2rem;
    padding: 2rem;
    margin: 16px 0;
    text-align: center;
  }

  label:focus,
  label:focus-within {
    outline: 1px solid #731414;
  }

  input {
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
</style>
