<template>
  <fieldset class="controls">
    <slot />
  </fieldset>
</template>

<style scoped>
  :where(.controls) {
    display: flex;
    align-items: center;
    padding: 8px;
    margin: 0;
    background-color: var(--near-black);
    border: 0;
  }
</style>
