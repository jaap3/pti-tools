<template>
  <fieldset class="controls">
    <slot />
  </fieldset>
</template>

<style scoped>
  :is(fieldset) {
    display: flex;
    align-items: center;
    padding: 8px;
    margin: 0;
    color: #fefefe;
    background: #121212;
    border: 0;
  }
</style>
