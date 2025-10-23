const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Tamanhos necessários para Android
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

function generateAndroidIcons(inputPath, outputDir) {
  console.log(`Gerando ícones Android de ${inputPath} para ${outputDir}...`);
  
  for (const [folder, size] of Object.entries(androidSizes)) {
    const targetDir = path.join(outputDir, 'app', 'src', 'main', 'res', folder);
    
    // Cria diretório se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const outputFiles = [
      path.join(targetDir, 'ic_launcher.png'),
      path.join(targetDir, 'ic_launcher_round.png'),
      path.join(targetDir, 'ic_launcher_foreground.png')
    ];
    
    outputFiles.forEach(outputFile => {
      // Usa ImageMagick (magick) ou sharp se disponível
      try {
        execSync(`magick convert "${inputPath}" -resize ${size}x${size} "${outputFile}"`, { stdio: 'inherit' });
        console.log(`✓ Criado: ${outputFile}`);
      } catch (error) {
        console.error(`Erro ao criar ${outputFile}. Instale ImageMagick: https://imagemagick.org/script/download.php`);
        process.exit(1);
      }
    });
  }
}

// Gera ícones para admin
generateAndroidIcons('resources/icon-admin.png', 'android-admin');
console.log('\n✓ Ícones do Admin gerados com sucesso!\n');

// Gera ícones para member
generateAndroidIcons('resources/icon-member.png', 'android-member');
console.log('\n✓ Ícones do Member gerados com sucesso!\n');
