const fs = require('fs');
const path = require('path');

const targetDir = 'Blueprints'; //
const keepFile = 'README.md';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

const items = fs.readdirSync(__dirname);

items.forEach(item => {
    // README, .git, scriptin kendisi ve Blueprints'e dokunma
    if (item !== keepFile && 
        item !== '.git' && 
        item !== 'organize_blueprints.js' && 
        item !== targetDir &&
        item !== 'node_modules') {
        
        const oldPath = path.join(__dirname, item);
        const newPath = path.join(__dirname, targetDir, item);

        try {
            fs.renameSync(oldPath, newPath);
            console.log(`🚀 Blueprints'e taşındı: ${item}`);
        } catch (err) {
            console.log(`⚠️ Hata: ${item} taşınamadı.`);
        }
    }
});
console.log("\n💎 OPERASYON TAMAM: Root artık tertemiz, sadece README mühürlü.");