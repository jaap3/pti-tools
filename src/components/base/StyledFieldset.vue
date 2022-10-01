<script setup lang="ts">
  import { nextTick, ref } from "vue"

  const props = withDefaults(
    defineProps<{
      canCollapse?: boolean
    }>(),
    {
      canCollapse: false,
    },
  )

  const el = ref<HTMLElement | null>(null)
  const isMinimized = ref(false)

  /**
   * Toggles the minimized state of the fieldset.
   */
  function toggle() {
    isMinimized.value = !isMinimized.value
    if (!isMinimized.value) {
      nextTick(() => {
        el.value?.scrollIntoView({ behavior: "smooth" })
      })
    }
  }
</script>
<template>
  <fieldset ref="el">
    <legend>
      <slot name="legend" />
      <button
        v-if="props.canCollapse"
        type="button"
        class="collapse"
        title="Minimize"
        @click="toggle"
      >
        <span class="material-icons">{{
          isMinimized ? "expand_more" : "expand_less"
        }}</span>
      </button>
    </legend>
    <Transition>
      <div v-show="!isMinimized">
        <slot />
      </div>
    </Transition>
  </fieldset>
</template>

<style scoped>
  :where(fieldset) {
    padding: 8px 0 0;
    margin: 0;
    overflow: hidden;
    border: 1px solid var(--medium-gray);
  }

  :where(legend) {
    display: flex;
    width: 100%;
    width: calc(100% - 16px);
    padding: 0 4px;
    margin: 0 auto;
    font-weight: 400;
    color: var(--almost-black);
    background-color: var(--almost-white);
  }

  :where(.collapse) {
    padding: 0;
    margin-left: auto;
    line-height: 1;
    color: var(--almost-black);
    cursor: pointer;
    background: none;
    border: none;
  }

  .v-enter-to,
  .v-leave-from {
    clip-path: inset(0);
    opacity: 1;
  }

  .v-enter-active,
  .v-leave-active {
    transition: all 0.25s ease;
  }

  .v-enter-from,
  .v-leave-to {
    clip-path: inset(100% 0 100% 0);
    opacity: 0;
  }
</style>
