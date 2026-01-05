const fs = require('fs');
const path = require('path');

// 1. Hedef klasör ismi (Taslaklar / Blueprints)
const targetDir = 'Blueprints';
const keepFile = 'README.md';

// 2. Klasör yoksa oluştur
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
    console.log(`✅ Klasör oluşturuldu: ${targetDir}`);
}

// 3. Mevcut dizindeki her şeyi oku
const items = fs.readdirSync(__dirname);

items.forEach(item => {
    // README.md, .git klasörü, scriptin kendisi ve Blueprints klasörüne dokunma
    if (item !== keepFile && 
        item !== '.git' && 
        item !== 'organize_blueprints.js' && 
        item !== targetDir &&
        item !== 'node_modules') {
        
        const oldPath = path.join(__dirname, item);
        const newPath = path.join(__dirname, targetDir, item);

        try {
            fs.renameSync(oldPath, newPath);
            console.log(`🚀 Taşındı: ${item} -> ${targetDir}/`);
        } catch (err) {
            console.log(`⚠️ Hata: ${item} taşınamadı.`, err.message);
        }
    }
});

console.log(`\n💎 OPERASYON TAMAM: Ana dizinde sadece ${keepFile} mühürlendi.`);