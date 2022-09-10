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

  /**
   * Converts the given number of bytes to a string representing the size
   * in megabytes (e.g. 1024 -> "1MB").
   *
   * @param bytes - The number of bytes to convert.
   * @returns A string representing the size in megabytes.
   */
  function displayBytes(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  /**
   * Emits an input event with the given file; unless the file is too large,
   * in which case an error message is displayed.
   *
   * @param file - The file to emit.
   */
  async function emitInput(file: File) {
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

  /**
   * Handles the input event from the file input element. Emits an input event
   * for each file in the input, up until the input is disabled.
   *
   * @param evt - The input event.
   */
  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    for (const file of Array.from(input.files ?? [])) {
      if (props.disabled) break
      await emitInput(file)
    }
  }

  /**
   * Handles the dragover event from the file input element. Prevents the
   * default action to allow the drop event to be fired.
   *
   * @param evt - The dragover event.
   */
  function handleDragOver(evt: DragEvent) {
    evt.preventDefault()
    if (!evt.dataTransfer) return
    evt.dataTransfer.dropEffect = "copy"
  }

  // Make sure eslint knows about the FileSystem API
  /* global FileSystemEntry, FileSystemDirectoryEntry, FileSystemFileEntry */
  /**
   * Handles a dropped file or directory. Emits an input event for each file
   * in the directory, up until the input is disabled.
   *
   * @param entry - The dropped entry.
   */
  async function collectFiles(entry: FileSystemEntry) {
    if (props.disabled) return
    if (entry.isFile) {
      const resolvedEntry: Promise<File> = new Promise((resolve, reject) => {
        ;(entry as FileSystemFileEntry).file(resolve, reject)
      })
      await emitInput(await resolvedEntry)
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

  /**
   * Creates a async generator that yields the filesystem entries from the
   * given list of file system entries. Skips any null entries, and stops
   * when the input is disabled.
   *
   * @param entries - The list of entries to yield.
   * @yields The next entry.
   */
  function* entryGenerator(
    entries: (FileSystemEntry | null)[],
  ): Generator<FileSystemEntry> {
    for (const entry of entries) {
      if (props.disabled) return
      if (entry !== null) {
        yield entry
      }
    }
  }

  /**
   * Handles the drop event from the file input element.
   *
   * @param evt - The drop event.
   */
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
      if (props.disabled) return
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
    position: relative;
    display: block;
    padding: 2rem;
    margin: 16px 0;
    text-align: center;
    background: #0a0a0a;
    border-radius: 2rem;
    outline: 1px dashed #fffefe;
  }

  label:focus,
  label:focus-within {
    outline: 1px solid #731414;
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
  }

  :disabled {
    cursor: not-allowed;
  }
</style>
