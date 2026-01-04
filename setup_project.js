const fs = require('fs');
const path = require('path');

console.log("🚀 KURULUM BAŞLIYOR: İlhan Art Protocol [F.P.P.]...");

const files = {
  'package.json': JSON.stringify({
    "name": "ilhanart-protocol",
    "private": true,
    "workspaces": ["[F.P.P.]/packages/*"],
    "scripts": { "build": "npm -w \"[F.P.P.]/packages/indexer\" run build" }
  }, null, 2),

  'README.md': `# İlhan Art Protocol — [F.P.P.] Engine\n\n> **System Status:** Active\n> **Architecture:** [F.P.P.] Core + UI Dashboard`,

  '.gitignore': `node_modules/\ndist/\n[F.P.P.]/data/*.db\n![F.P.P.]/data/last_proof_run.json\n.DS_Store`,

  '[F.P.P.]/packages/indexer/package.json': JSON.stringify({
    "name": "@ilhan-art/fpp-indexer",
    "version": "1.0.0",
    "main": "dist/cli.js",
    "scripts": { "start": "node dist/cli.js" }
  }, null, 2),

  '[F.P.P.]/packages/indexer/src/cli.ts': `console.log("FPP Engine Active");`,
  
  '[F.P.P.]/data/last_proof_run.json': JSON.stringify({
    "system": "F.P.P. Core",
    "status": "active",
    "last_update": new Date().toISOString()
  }, null, 2),

  'ui/index.html': `<!DOCTYPE html><html><body><h1>[F.P.P.] SYSTEM ONLINE</h1></body></html>`
};

try {
    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(__dirname, filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, content);
        console.log(`✅ OLUŞTURULDU: ${filePath}`);
    }
    console.log("\n🎉 İŞLEM BAŞARILI! Dosyalar hazır.");
} catch (error) {
    console.error("\n❌ HATA OLUŞTU:", error);
}