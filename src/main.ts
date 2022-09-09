import "randomuuid" // polyfill for crypto.randomUUID()

import { createPinia } from "pinia"
import { createApp } from "vue"

import App from "@/App.vue"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount("#app")
