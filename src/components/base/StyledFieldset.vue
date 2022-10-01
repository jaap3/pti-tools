<template>
  <fieldset>
    <legend>
      <slot name="legend" />
    </legend>
    <slot />
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
</style>
