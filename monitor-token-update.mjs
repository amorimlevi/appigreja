import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env', 'utf8')
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Monitorando tokens do membro 37...\n')
console.log('Faça logout e login no app iOS Member agora!\n')

let checkCount = 0
const maxChecks = 30 // 30 segundos

const interval = setInterval(async () => {
  checkCount++
  
  const { data, error } = await supabase
    .from('device_tokens')
    .select('id, member_id, platform, bundle_id, token, created_at')
    .eq('member_id', 37)
    .eq('platform', 'ios')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (error) {
    console.error('❌ Erro:', error)
    clearInterval(interval)
    process.exit(1)
  }
  
  if (data && data.length > 0) {
    const token = data[0]
    const tokenLength = token.token?.length || 0
    const tokenType = tokenLength === 64 ? '⚠️  APNs (ANTIGO)' : tokenLength > 100 ? '✅ FCM (NOVO)' : '❓'
    const createdAt = new Date(token.created_at)
    const now = new Date()
    const diffSeconds = Math.floor((now - createdAt) / 1000)
    
    process.stdout.write(`\r[${checkCount}s] Token: ${tokenType} (${tokenLength} chars) - Criado há ${diffSeconds}s                `)
    
    // Se foi criado nos últimos 10 segundos, é um novo token!
    if (diffSeconds < 10 && tokenLength > 100) {
      console.log('\n\n🎉 NOVO TOKEN FCM DETECTADO!')
      console.log(`   Member ID: ${token.member_id}`)
      console.log(`   Bundle ID: ${token.bundle_id}`)
      console.log(`   Token Length: ${tokenLength} chars`)
      console.log(`   Token Preview: ${token.token.substring(0, 50)}...`)
      console.log(`   Criado: ${createdAt.toLocaleString()}`)
      console.log('\n✅ Token atualizado com sucesso!')
      console.log('   Agora você pode enviar uma notificação de teste.')
      clearInterval(interval)
      process.exit(0)
    }
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n\n⏱️  Timeout: Nenhum novo token detectado em 30 segundos.')
    console.log('   Certifique-se de que fez logout/login no app.')
    clearInterval(interval)
    process.exit(0)
  }
}, 1000)
