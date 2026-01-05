const fs = require('fs');
const path = require('path');

// 1. Hedef klasör (Görselde oluşturduğun isimle)
const targetDir = 'protocol-tools';

// 2. Taşınacak kritik araçlar
const filesToMove = [
    'ekle_pollock.js',
    'kurtarma_operasyonu.js',
    'kurulum_genesis.js',
    'kurulum_yolharitasi.js',
    'pollock_update.js',
    'setup_project.js',
    'son_temizlik.js'
];

// 3. Klasör kontrolü
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
    console.log(`✅ Klasör oluşturuldu: ${targetDir}`);
}

// 4. Mühürleme ve Taşıma Operasyonu
filesToMove.forEach(file => {
    const oldPath = path.join(__dirname, file);
    const newPath = path.join(__dirname, targetDir, file);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`🚀 Mühürlendi ve Taşındı: ${file} -> ${targetDir}/`);
    } else {
        console.log(`⚠️ Bulunamadı: ${file} (Zaten taşınmış olabilir)`);
    }
});

console.log("\n💎 İŞLEM TAMAM: Protokol vitrini artık tertemiz.");