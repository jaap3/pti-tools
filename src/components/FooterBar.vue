<script setup lang="ts">
  import GithubButton from "vue-github-button"

  withDefaults(
    defineProps<{
      showAppreciation: boolean
    }>(),
    {
      showAppreciation: false,
    },
  )
</script>

<template>
  <footer>
    <div class="repo">
      <github-button
        href="https://github.com/jaap3/pti-tools"
        data-size="large"
        aria-label="View source"
        >View source</github-button
      >
      <github-button
        href="https://github.com/jaap3/pti-tools/issues"
        data-icon="octicon-issue-opened"
        data-size="large"
        aria-label="Report an issue"
        >Report issue</github-button
      >
    </div>
    <div v-if="showAppreciation" class="appreciate">
      <github-button
        href="https://github.com/jaap3/pti-tools"
        data-icon="octicon-star"
        data-size="large"
        data-show-count="true"
        aria-label="Star jaap3/pti-tools on GitHub"
        >Star</github-button
      >
      <github-button
        href="https://github.com/sponsors/jaap3"
        data-icon="octicon-heart"
        data-size="large"
        aria-label="Sponsor @jaap3 on GitHub"
        >Sponsor</github-button
      >
    </div>
  </footer>
</template>

<style scoped>
  footer {
    position: sticky;
    bottom: 0;
    display: flex;
    padding: 8px 16px;
    background-color: #0a0a0a;
  }

  footer .appreciate {
    margin-left: auto;
    text-align: right;
  }

  footer > div {
    display: flex;
    flex-direction: column;
  }

  @media only screen and (min-width: 490px) {
    footer > div {
      flex-direction: row;
    }

    footer > div > *:not(:first-child) {
      margin-left: 16px;
    }
  }
</style>
