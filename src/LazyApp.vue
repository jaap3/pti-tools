<script setup type="ts">
  import { storeToRefs } from "pinia"
  import { defineAsyncComponent } from "vue"

  import SlicesEditor from "@/components/slices/SlicesEditor.vue"
  import { useSlices }  from "@/stores/slices"

  const LayerEditor = defineAsyncComponent(() => import("@/components/layers/LayerEditor.vue"))

  const slicesStore = useSlices()
  const { activeSlice } = storeToRefs(slicesStore)
</script>
<template>
  <LayerEditor v-if="activeSlice" />
  <SlicesEditor v-else />
</template>
