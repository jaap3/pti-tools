import { createApp } from "vue"
import { createPinia } from "pinia"
import { AudioContextKey } from "./constants"
import App from "@/App.vue"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.provide(
  AudioContextKey,
  new AudioContext({
    latencyHint: "interactive",
    sampleRate: 44100,
  }),
)

app.mount("#app")
