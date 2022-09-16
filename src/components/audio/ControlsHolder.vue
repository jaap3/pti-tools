<template>
  <div class="controls" title="">
    <slot />
  </div>
</template>

<style scoped>
  :is(.controls) {
    display: flex;
    padding: 8px;
    background: #121212;
  }
</style>
