<template>
  <div class="controls" title="">
    <slot />
  </div>
</template>

<style scoped>
  :is(.controls) {
    display: flex;
    padding: 8px;
    align-items: center;
    background: #121212;
  }
</style>
