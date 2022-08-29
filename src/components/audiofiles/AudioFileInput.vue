<script setup lang="ts">
  import { useMessages } from "@/stores/messages"

  const props = withDefaults(defineProps<{ disabled: boolean }>(), {
    disabled: false,
  })

  const emit = defineEmits<{
    (e: "input", file: File): Promise<void>
  }>()

  const sizeThreshold = 1024 * 1024 * 10 // 10MB

  const messagesStore = useMessages()

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
    await emit("input", file)
  }

  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    for (const file of Array.from(input.files ?? [])) {
      if (props.disabled) break
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
    if (props.disabled) return
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
        if (props.disabled) break
        await collectFiles(entry)
      }
    }
  }

  function* entryGenerator(entries: (FileSystemEntry | null)[]) {
    for (const entry of entries) {
      if (props.disabled) return
      if (entry !== null) {
        yield entry
      }
    }
  }

  async function handleDrop(evt: DragEvent) {
    evt.preventDefault()
    if (props.disabled) return
    if (!evt.dataTransfer) return

    // Collect files from the drop event, has to be done before processing the files
    // because the browser will only let use access for a short window of time.
    const entries: Generator<FileSystemEntry> = entryGenerator(
      Array.from(evt.dataTransfer.items).map((item) => {
        if (item.kind === "file") {
          // Even though it's prefixed with "webkit" most browsers support it.
          return item.webkitGetAsEntry()
        }
        return null
      }),
    )
    for await (const entry of entries) {
      await collectFiles(entry)
    }
  }
</script>

<template>
  <label :class="{ disabled }" @dragover="handleDragOver" @drop="handleDrop">
    Choose / drop audio file(s) / folders
    <small
      >(<code>.wav</code>,&nbsp;<code>.mp3</code>,&nbsp;<code>.flac</code>,
      etc.)</small
    >
    <input
      multiple
      type="file"
      accept="audio/*"
      :disabled="disabled"
      @input="handleInput"
    />
  </label>
</template>

<style scoped>
  label {
    display: block;
    position: relative;
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

  :disabled {
    cursor: not-allowed;
  }
</style>
