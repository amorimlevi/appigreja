import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 main.jsx carregado!')

// Aguardar DOM carregar completamente
const initApp = async () => {
  console.log('📍 Root element:', document.getElementById('root'))
  console.log('🌐 window.location:', window.location.href)
  
  const root = document.getElementById('root')

  if (!root) {
    console.error('ERRO: Elemento root não encontrado!')
    return
  }

  // Configurar Status Bar após DOM estar pronto
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    console.log('🎨 Configurando StatusBar...')
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#000000' })
    console.log('✅ StatusBar configurado!')
  } catch (error) {
    console.error('❌ Erro ao configurar Status Bar:', error)
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
