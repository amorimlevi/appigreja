const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'dist', 'index.member.html');

if (!fs.existsSync(htmlPath)) {
  console.log('⚠️  index.member.html não encontrado, pulando correção');
  process.exit(0);
}

console.log('🔧 Corrigindo paths do index.member.html...');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Corrigir todos os paths absolutos errados
html = html.replace(/\.\.\/\.\.\/\.\.\/\.\.\/Projetos\/appigre\//g, './');

fs.writeFileSync(htmlPath, html);
console.log('✅ Paths corrigidos com sucesso!');
