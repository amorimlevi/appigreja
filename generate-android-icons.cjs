const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Tamanhos necessários para Android
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generateAndroidIcons(inputPath, outputDir, appName) {
  console.log(`\nGerando ícones ${appName} de ${inputPath}...`);
  
  for (const [folder, size] of Object.entries(androidSizes)) {
    const targetDir = path.join(outputDir, 'app', 'src', 'main', 'res', folder);
    
    // Cria diretório se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const iconFiles = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
    
    for (const iconFile of iconFiles) {
      const outputFile = path.join(targetDir, iconFile);
      
      try {
        await sharp(inputPath)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(outputFile);
        
        console.log(`✓ ${folder}/${iconFile}`);
      } catch (error) {
        console.error(`✗ Erro ao criar ${outputFile}:`, error.message);
      }
    }
  }
}

async function main() {
  try {
    // Gera ícones para admin
    await generateAndroidIcons('resources/icon-admin.png', 'android-admin', 'ADMIN');
    console.log('\n✅ Ícones do Admin gerados com sucesso!\n');
    
    // Gera ícones para member
    await generateAndroidIcons('resources/icon-member.png', 'android-member', 'MEMBER');
    console.log('\n✅ Ícones do Member gerados com sucesso!\n');
    
    console.log('Todos os ícones foram gerados! 🎉');
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

main();
