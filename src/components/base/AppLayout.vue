<script setup lang="ts">
  import ControlsHolder from "./ControlsHolder.vue"
</script>

<template>
  <form class="container" @submit.prevent>
    <div class="top">
      <ControlsHolder>
        <slot name="top" />
      </ControlsHolder>
    </div>
    <div class="center">
      <slot name="main" />
    </div>
    <div class="bottom">
      <slot name="bottom" />
    </div>
  </form>
</template>

<style scoped>
  .container {
    top: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
  }

  .top {
    padding-bottom: 12px;
    margin-bottom: -12px;
    background-color: var(--near-black);
  }

  .center {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .bottom {
    background-color: #0a0a0af0;
  }
</style>
