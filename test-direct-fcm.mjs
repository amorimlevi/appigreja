import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env', 'utf8')
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const serviceRoleKey = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

if (!serviceRoleKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Buscar token do membro 37
const { data: tokens } = await supabase
  .from('device_tokens')
  .select('*')
  .eq('member_id', 37)
  .eq('platform', 'ios')
  .order('created_at', { ascending: false })
  .limit(1)

if (!tokens || tokens.length === 0) {
  console.error('❌ Nenhum token encontrado para membro 37')
  process.exit(1)
}

const token = tokens[0]
console.log('📱 Token encontrado:')
console.log(`   Member: ${token.member_id}`)
console.log(`   Platform: ${token.platform}`)
console.log(`   Bundle: ${token.bundle_id}`)
console.log(`   Token length: ${token.token.length} chars`)
console.log(`   Created: ${new Date(token.created_at).toLocaleString()}\n`)

// Chamar Edge Function diretamente
console.log('📤 Chamando Edge Function diretamente...\n')

const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Teste Direto',
    body: 'Teste chamando a Edge Function diretamente',
    type: 'aviso'
  })
})

const result = await response.json()
console.log('📥 Resposta da Edge Function:')
console.log(JSON.stringify(result, null, 2))

if (!response.ok) {
  console.error('\n❌ Erro na requisição!')
  console.log('   Verifique os logs da Edge Function no Supabase Dashboard')
}
