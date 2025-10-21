import React from 'react'
import ReactDOM from 'react-dom/client'
import AppMember from './AppMember'
import './index.css'

console.log('🚀 MEMBER APP - Iniciando...')

const root = document.getElementById('root')
if (!root) {
  console.error('❌ Root element não encontrado!')
  alert('Erro: Root element não encontrado')
} else {
  console.log('✅ Root encontrado, renderizando AppMember')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppMember />
    </React.StrictMode>,
  )
  console.log('✅ AppMember renderizado')
}
