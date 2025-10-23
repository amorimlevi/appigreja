const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

console.log('🔧 Corrigindo paths do index.html...');

// Corrigir todos os paths absolutos errados
html = html.replace(/\.\.\/\.\.\/\.\.\/\.\.\/Projetos\/appigre\//g, './');

fs.writeFileSync(htmlPath, html);
console.log('✅ Paths corrigidos com sucesso!');
