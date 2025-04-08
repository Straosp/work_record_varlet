import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Varlet, {StyleProvider} from '@varlet/ui'
import '@varlet/ui/es/style.mjs'
import '@varlet/touch-emulator'
import {lightTheme} from "./theme/light.ts";
import router from "./router.ts";
import {useColorMode} from "@vueuse/core";
import {darkTheme} from "./theme/dark.ts";
//
if (useColorMode().value == "light"){
    StyleProvider(lightTheme)
}else if(useColorMode().value == "dark"){
    StyleProvider(darkTheme)
}
const app = createApp(App)
app.use(Varlet)
    .use(router)
    .mount('#app')
