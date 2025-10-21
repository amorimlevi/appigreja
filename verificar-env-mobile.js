// Script para verificar se as variáveis de ambiente estão sendo injetadas no build
// Execute: node verificar-env-mobile.js

import { readFileSync } from 'fs';

console.log('🔍 Verificando variáveis de ambiente no build...\n');

try {
    const jsFile = readFileSync('dist/assets/index.member-ee731a46.js', 'utf-8');
    
    const hasSupabaseUrl = jsFile.includes('dvbdvftaklstyhpqznmu.supabase.co');
    const hasAnonKey = jsFile.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    
    console.log('✅ URL do Supabase encontrada:', hasSupabaseUrl);
    console.log('✅ Anon Key do Supabase encontrada:', hasAnonKey);
    
    if (!hasSupabaseUrl || !hasAnonKey) {
        console.log('\n❌ PROBLEMA: Variáveis de ambiente não foram injetadas no build!');
        console.log('Verifique se o arquivo .env existe e tem as variáveis corretas.');
    } else {
        console.log('\n✅ Build está OK - variáveis de ambiente injetadas corretamente');
    }
} catch (error) {
    console.error('❌ Erro ao ler arquivo:', error.message);
}
