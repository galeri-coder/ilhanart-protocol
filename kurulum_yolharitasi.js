const fs = require('fs');
const path = require('path');

console.log("🏛️ İLHAN ART ROADMAP: BÜYÜK GÖÇ BAŞLIYOR...");

// YENİ REPO KLASÖRÜ (Ana dizinin içinde oluşturulacak)
const newRepoName = 'ilhanart-roadmap';
const targetRoot = path.join(__dirname, newRepoName);

// KLASÖR YAPISI (Senin Haritanın Temizlenmiş Hali)
const structure = [
    // 1. PROTOCOLS (ANAYASA)
    'protocols',
    'protocols/fpp-core',          // Sert Kurallar
    'protocols/fpp-extensions',    // Utility (NFT/Privilege YOK)
    'protocols/ecosystem',         // Etkinlikler & Infra

    // 2. REGISTRY (KANITLAR)
    'registry',
    'registry/snapshots',
    'registry/merkle-roots',
    'registry/contribution-proofs',

    // 3. UI INFRASTRUCTURE (ARAYÜZ & KODLAR)
    'ui-infrastructure',
    'ui-infrastructure/exhibition-components',
    'ui-infrastructure/dashboard', // Buraya eski [PoArt] taşınacak

    // 4. ROADMAP (ZAMAN)
    'roadmap',

    // 5. INITIATIVES (GÖREVLER)
    'initiatives',
    'initiatives/translation'
];

// --- 1. KLASÖRLERİ OLUŞTUR ---
if (fs.existsSync(targetRoot)) {
    console.log("⚠️ Klasör zaten var, üzerine yazılıyor...");
} else {
    fs.mkdirSync(targetRoot);
}

structure.forEach(dir => {
    const fullPath = path.join(targetRoot, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// --- 2. MARKDOWN DOSYALARINI OLUŞTUR (İÇLERİ DOLU) ---

// ROOT README
writeMD('README.md', `# Ilhan Art Roadmap & Protocol Repository\n\n> **Culture > Capital**\n\nThis repository houses the constitution, technical infrastructure, and strategic roadmap of the Founding Patrons Protocol (FPP).\n\n## Structure\n* **Protocols:** The immutable rules of governance.\n* **Registry:** The cryptographic proof of history.\n* **UI:** The [PoArt] Terminal and visual interfaces.\n* **Roadmap:** The Le Corbusier Masterplan.`);

// PROTOCOLS
writeMD('protocols/README.md', `# The Constitution\n\nNavigation for protocol documents. Governance flows from FPP Core to Extensions.`);
writeMD('protocols/fpp-core/founding-patrons-protocol-EN.md', `# Founding Patrons Protocol (Core)\n\nDefining the axioms of the system. Hard-coded meritocracy.`);
writeMD('protocols/fpp-core/governance.md', `# Governance Mechanics\n\nLogarithmic voting weights and the 40% Integrity Veto.`);
writeMD('protocols/fpp-core/authority-appeals.md', `# Authority & Appeals\n\nHow disputes are resolved via the Council of Architects.`);

writeMD('protocols/fpp-extensions/token-utility.md', `# Token Utility\n\nToken is not for speculation. It is for:\n1. Curation Voting\n2. Treasury Allocation\n3. Protocol Parameter Adjustment`);
writeMD('protocols/fpp-extensions/holder-tiers.md', `# Meritocratic Tiers\n\n* **Legendary:** Proven builders (Top 10)\n* **Senior:** Long-term stakers\n* **Veteran:** Verified contributors`);

writeMD('protocols/ecosystem/physical-infrastructure.md', `# Physical-Digital Bridge\n\nThe Kethüda Hamamı Exhibition standards and hardware requirements.`);
writeMD('protocols/ecosystem/meme-coin-killer.md', `# The Meme Coin Killer Manifesto\n\nWhy we exist: To destroy nihilistic speculation with meaningful production.`);

// REGISTRY
writeMD('registry/digitalnotary.md', `# Digital Notary Schema\n\nJSON schemas for verifying contributions on-chain.`);
writeMD('registry/ILHAN-2025-REG-001.json', `{\n  "id": "ILHAN-2025-REG-001",\n  "type": "GENESIS",\n  "timestamp": "2025-12-01T00:00:00Z",\n  "hash": "0x..."\n}`);

// ROADMAP
writeMD('roadmap/Green-Blue-Stages.md', `# Phase 1 & 2 (Foundation)\n\nEstablishment of the protocol and initial UI deployment.`);
writeMD('roadmap/Purple-Stages-1.md', `# Phase 3 (The Renaissance)\n\nExpansion of the art collection and global partnerships.`);

// INITIATIVES
writeMD('initiatives/translation/README.md', `# The Translation Initiative\n\nTranslating 10 seminal works of philosophy and science into Turkish.`);

// --- 3. [PoArt] TERMİNALİNİ TAŞI (EN ÖNEMLİ KISIM) ---
const oldPoArtPath = path.join(__dirname, '[PoArt]');
const newPoArtPath = path.join(targetRoot, 'ui-infrastructure/dashboard');

if (fs.existsSync(oldPoArtPath)) {
    console.log("🚚 [PoArt] Terminali yeni yerine taşınıyor...");
    // İçeriği kopyala (Daha güvenli)
    fs.cpSync(oldPoArtPath, newPoArtPath, { recursive: true });
    console.log("✅ Terminal başarıyla 'ui-infrastructure/dashboard' altına kuruldu.");
} else {
    console.log("⚠️ DİKKAT: [PoArt] klasörü bulunamadı. UI kısmı boş kaldı.");
}

console.log("🏁 KURULUM TAMAMLANDI! 'ilhanart-roadmap' klasörü hazır.");

// YARDIMCI FONKSİYON
function writeMD(relPath, content) {
    fs.writeFileSync(path.join(targetRoot, relPath), content);
}