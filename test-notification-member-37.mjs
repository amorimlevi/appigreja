import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env', 'utf8')
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('📤 Criando aviso de teste para membro 37...\n')

const { data, error } = await supabase
  .from('avisos')
  .insert({
    titulo: 'Teste iOS Member',
    mensagem: 'Testando notificação para membro 37'
  })
  .select()

if (error) {
  console.error('❌ Erro:', error)
} else {
  console.log('✅ Aviso criado!')
  console.log('   Aguarde 5-10 segundos...')
  console.log('   A notificação deve chegar no iOS do membro 37')
}
