<script setup lang="ts">
  import StyledFieldset from "@/components/base/StyledFieldset.vue"
  import { useMessages } from "@/stores/messages"

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      onInput?: (file: File) => Promise<unknown>
    }>(),
    {
      disabled: false,
      onInput: async () => null,
    },
  )

  const messagesStore = useMessages()

  const sizeThreshold = 1024 * 1024 * 10 // 10MB

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
    await props.onInput(file)
  }

  /**
   * Handles the input event from the file input element. Emits an input event
   * for each file in the input. If the input is disabled while emitting,
   * one final input event is emitted allowing the listener to keep track
   * of the first file that must be ignored.
   *
   * @param evt - The input event.
   */
  async function handleInput(evt: Event) {
    const input = evt.target as HTMLInputElement
    for (const file of Array.from(input.files ?? [])) {
      const wasDisabled = props.disabled
      await emitInput(file)
      // The input was disabled in the previous iteration, break.
      if (wasDisabled && props.disabled) return
    }
    input.value = ""
  }

  /**
   * Handles the dragover event from the file input element. Prevents the
   * default action to allow the drop event to be fired.
   *
   * @param evt - The dragover event.
   */
  function handleDragOver(evt: DragEvent) {
    if (!evt.dataTransfer) return
    evt.dataTransfer.dropEffect = "copy"
  }

  // Make sure eslint knows about the FileSystem API
  /* global FileSystemEntry, FileSystemDirectoryEntry, FileSystemFileEntry */
  /**
   * Handles a dropped file or directory. Emits an input event for each file
   * in the directory. If the input is disabled while emitting,
   * one final input event is emitted allowing the listener to keep track
   * of the first file that must be ignored.
   *
   * @param entry - The dropped entry.
   */
  async function collectFiles(entry: FileSystemEntry) {
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
        const wasDisabled = props.disabled
        await collectFiles(entry)
        if (wasDisabled && props.disabled) return
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
    // as browsers only allow access for a short window of time.
    const entries: FileSystemEntry[] = Array.from(evt.dataTransfer.items)
      .map((item) => {
        if (item.kind === "file") {
          // Even though it's prefixed with "webkit" most browsers support it.
          return item.webkitGetAsEntry()
        }
        return null
      })
      .filter((entry): entry is FileSystemEntry => entry !== null)
    for (const entry of entries) {
      const wasDisabled = props.disabled
      await collectFiles(entry)
      if ((wasDisabled || entry.isDirectory) && props.disabled) return
    }
  }
</script>

<template>
  <StyledFieldset>
    <template #legend>
      <span>Sample loader</span>
    </template>
    <label
      :class="{ disabled }"
      @dragover.prevent="handleDragOver"
      @drop="handleDrop"
    >
      Choose / drop audio file(s) / folders
      <small
        >(<code>.wav</code>,&nbsp;<code>.mp3</code>,&nbsp;<code>.flac</code>,
        etc.)</small
      >
      <input
        multiple
        type="file"
        accept="audio/*"
        :disabled="props.disabled"
        @input="handleInput"
      />
    </label>
  </StyledFieldset>
</template>

<style scoped>
  fieldset {
    margin-top: -12px;
    background: var(--almost-black);
  }

  label {
    position: relative;
    display: block;
    padding: 24px;
    margin: 8px 8px 16px;
    text-align: center;
    border-radius: 2rem;
    outline: 1px dashed var(--almost-white);
  }

  label:focus,
  label:focus-within {
    outline: 1px solid var(--medium-dark-red);
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
