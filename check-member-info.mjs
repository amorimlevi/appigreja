import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env', 'utf8')
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()

const supabase = createClient(supabaseUrl, supabaseKey)

// Get member with FCM token
const { data: member37 } = await supabase
  .from('members')
  .select('id, nome, telefone')
  .eq('id', 37)
  .single()

console.log('✅ Member with FCM token (notifications will work):')
console.log(`   ID: ${member37?.id}`)
console.log(`   Nome: ${member37?.nome}`)
console.log(`   Telefone: ${member37?.telefone}\n`)

// Check other members
const { data: otherMembers } = await supabase
  .from('members')
  .select('id, nome, telefone')
  .in('id', [33, 34, 31])

console.log('⚠️  Members with old APNs tokens (notifications will NOT work):')
otherMembers.forEach(m => {
  console.log(`   ID: ${m.id}, Nome: ${m.nome}, Tel: ${m.telefone}`)
})
