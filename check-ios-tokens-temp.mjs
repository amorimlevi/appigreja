import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env', 'utf8')
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim()
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase
  .from('device_tokens')
  .select('id, member_id, platform, bundle_id, token, created_at')
  .eq('platform', 'ios')
  .order('created_at', { ascending: false })
  .limit(10)

if (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}

console.log('🔍 iOS Tokens:\n')

data.forEach((t, i) => {
  const len = t.token?.length || 0
  const type = len === 64 ? '⚠️  APNs' : len > 100 ? '✅ FCM' : '❓'
  console.log(`${i + 1}. ${type} (${len} chars)`)
  console.log(`   Member: ${t.member_id}, Bundle: ${t.bundle_id || 'NULL'}`)
  console.log(`   Token: ${t.token?.substring(0, 40)}...`)
  console.log(`   Created: ${new Date(t.created_at).toLocaleString()}\n`)
})
