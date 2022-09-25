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
    <div class="main">
      <slot name="main" />
    </div>
    <div class="bottom">
      <slot name="bottom" />
    </div>
  </form>
</template>

<style scoped>
  .top {
    padding-bottom: 12px;
    margin-bottom: -12px;
    background-color: var(--near-black);
  }

  .container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
</style>
