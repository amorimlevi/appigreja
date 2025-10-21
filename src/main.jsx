import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx carregado!')
console.log('Root element:', document.getElementById('root'))

// Configurar Status Bar (comentado temporariamente para debug)
// import { StatusBar, Style } from '@capacitor/status-bar'
// const setupStatusBar = async () => {
//   try {
//     await StatusBar.setOverlaysWebView({ overlay: true })
//     await StatusBar.setStyle({ style: Style.Light })
//     await StatusBar.setBackgroundColor({ color: '#00000000' })
//   } catch (error) {
//     console.log('Status Bar não disponível', error)
//   }
// }
// setupStatusBar()

// Aguardar DOM carregar completamente
const initApp = () => {
  const root = document.getElementById('root')

  if (!root) {
    console.error('ERRO: Elemento root não encontrado!')
    return
  }

  console.log('Renderizando App...')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('App renderizado!')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
