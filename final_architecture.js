const fs = require('fs');
const path = require('path');

const root = __dirname;
const blueprints = path.join(root, 'Blueprints');

// Blueprints yoksa oluştur
if (!fs.existsSync(blueprints)) fs.mkdirSync(blueprints);

// 1. DIŞARI ÇIKACAKLAR (Ana Klasörler ve Sistem Dosyaları)
const coreItems = ['[F.P.P.]', '[PoArt]', 'ui', '.gitignore', 'package.json', 'README.md'];

coreItems.forEach(item => {
    const oldPath = path.join(blueprints, item);
    const newPath = path.join(root, item);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Root'a geri alındı: ${item}`);
    }
});

// 2. İÇERİ GİRECEKLER (Geri kalan her şey Blueprints'e)
const allInRoot = fs.readdirSync(root);
allInRoot.forEach(item => {
    // README, Core Klasörler, Git, Blueprints ve bu script hariç her şeyi taşı
    if (!coreItems.includes(item) && 
        item !== 'Blueprints' && 
        item !== '.git' && 
        item !== 'node_modules' && 
        item !== 'final_architecture.js') {
        
        const oldPath = path.join(root, item);
        const newPath = path.join(blueprints, item);
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`🚀 Blueprints'e taşındı: ${item}`);
        } catch (e) {
            console.log(`⚠️ Hata: ${item} taşınamadı.`);
        }
    }
});

console.log("\n💎 MİMARİ TAMAMLANDI: Root tertemiz.");