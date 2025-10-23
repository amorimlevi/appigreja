import React from 'react'
import ReactDOM from 'react-dom/client'
import AppMember from './AppMember'
import './index.css'

console.log('🚀 MEMBER APP - Iniciando...')

// Aguardar DOM carregar completamente
const initApp = async () => {
  console.log('📍 Root element:', document.getElementById('root'))
  console.log('🌐 window.location:', window.location.href)
  
  const root = document.getElementById('root')

  if (!root) {
    console.error('❌ Root element não encontrado!')
    alert('Erro: Root element não encontrado')
    return
  }

  // Configurar Status Bar após DOM estar pronto
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    console.log('🎨 Configurando StatusBar...')
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#000000' })
    console.log('✅ StatusBar configurado!')
  } catch (error) {
    console.error('❌ Erro ao configurar Status Bar:', error)
  }

  console.log('✅ Root encontrado, renderizando AppMember')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppMember />
    </React.StrictMode>,
  )
  console.log('✅ AppMember renderizado')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
