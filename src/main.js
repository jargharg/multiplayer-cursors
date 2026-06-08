import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

const elApp = document.createElement('div')
document.body.appendChild(elApp)
app.mount(elApp)
