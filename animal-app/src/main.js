import { mount } from 'svelte'
import './css/app.css'
import './css/card.css'
import './css/tooltip.css'
import './css/specialcards.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
