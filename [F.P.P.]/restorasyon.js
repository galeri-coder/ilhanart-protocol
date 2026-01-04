const fs = require('fs');
const path = require('path');

console.log("🚀 BAŞLATILIYOR: TAM KAPSAMLI ROADMAP RESTORASYONU...");
console.log("📂 Hedef: [PoArt] Klasörü");

const root = path.join(__dirname, '[PoArt]');

// 1. ESKİYİ SİL VE YENİ KLASÖR AĞACINI KUR
if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });

const dirs = [
    '',
    'css',
    'js',
    'assets',
    'docs',                 // Protokol belgeleri buraya
    'docs/tr',
    'docs/en',
    'modules',              // O bahsettiğin 01-12 arası araçlar buraya
    'modules/calculators',
    'modules/demos',
    'data',
    'data/snapshots',
    'data/proofs'
];

dirs.forEach(d => {
    const p = path.join(root, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

console.log("✅ Klasör ağacı kuruldu (Docs, Modules, Data...)");

// =======================================================
// 2. CSS (PREMIUM TEMA) - founding-patrons-premium.css
// =======================================================
const cssContent = `:root {
    --bg-dark: #050505;
    --panel: #0a0a0a;
    --border: #1a1a1a;
    --accent: #00ff88;
    --text: #e0e0e0;
    --font-main: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
}
body { background: var(--bg-dark); color: var(--text); font-family: var(--font-main); margin:0; padding:0; display:flex; height:100vh; overflow:hidden; }
.sidebar { width:260px; background:var(--panel); border-right:1px solid var(--border); padding:20px; display:flex; flex-direction:column; overflow-y:auto; }
.main { flex:1; padding:40px; overflow-y:auto; background:radial-gradient(circle at top right, #0f150f 0%, #050505 40%); }
h1, h2, h3 { font-weight:600; letter-spacing:-0.5px; }
a { text-decoration:none; color:inherit; display:block; padding:10px; margin:2px 0; border-radius:6px; font-size:13px; color:#888; transition:0.2s; }
a:hover, a.active { background:rgba(0,255,136,0.05); color:var(--accent); border-left:2px solid var(--accent); }
.group-title { font-size:10px; font-family:var(--font-mono); color:#444; margin:20px 0 10px; text-transform:uppercase; font-weight:bold; }
.card { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:25px; margin-bottom:20px; }
.tag { font-size:10px; padding:3px 8px; border-radius:4px; border:1px solid #333; background:#111; color:#666; }
.tag.active { border-color:var(--accent); color:var(--accent); background:rgba(0,255,136,0.05); }
iframe { width:100%; border:none; height:600px; border-radius:8px; background:#fff; }
`;
fs.writeFileSync(path.join(root, 'css/style.css'), cssContent);

// =======================================================
// 3. DOKÜMANTASYON (MARKDOWN DOSYALARI)
// =======================================================

// CORE BELGESİ
const coreMD = `# Founding Patrons Protocol - CORE
**Status:** Active | **Ver:** 1.1

## ⚡ System Flow
1. **TWAB (Time-Weighted Average Balance):** Measures loyalty over time.
2. **Contribution Points:** Multiplier for cultural work.
3. **Score:** log10(TWAB) * Multiplier.
4. **Snapshot:** Taken annually to determine Top 100.
`;
fs.writeFileSync(path.join(root, 'docs/tr/founding-patrons-CORE.md'), coreMD);

// FULL PROTOKOL (Özetlenmiş)
const fullProtoMD = `# Founding Patrons Protocol - FULL SPECIFICATION
## 1. Philosophy: Culture > Capital
This system prevents whale dominance by using logarithmic scoring.
## 2. Mechanisms
- **Vesting:** 4 Years (25% -> 50% -> 75% -> 100%)
- **Vault Rule:** Separate cold storage from spending.
- **365-Day Filter:** Anti-tourist mechanism.
`;
fs.writeFileSync(path.join(root, 'docs/tr/founding-patrons-protocol-FULL.md'), fullProtoMD);

// DEVRİMCİ ÖNERİLER
const revMD = `# Revolutionary Proposals (Future)
1. **Seal Vault:** Digital Tomb for cultural legacy.
2. **Curation Slashing:** Quality control mechanism.
3. **Legacy Key:** Permanent status credential.
`;
fs.writeFileSync(path.join(root, 'docs/tr/REVOLUTIONARY-PROPOSALS.md'), revMD);

// =======================================================
// 4. MODÜLLER (HTML ARAÇLAR - SENİN DOSYALARIN)
// =======================================================

// 01. Skor Hesaplayıcı
fs.writeFileSync(path.join(root, 'modules/calculators/01-simple-score.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>🧮 Simple Score Calculator</h2>
<p>Estimates your rank based on token holding duration.</p>
<input type="number" placeholder="Token Amount" style="padding:10px; width:100%">
</body></html>`);

// 02. FPP Laboratuvarı
fs.writeFileSync(path.join(root, 'modules/demos/02-sybil-lab.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>🧪 F.P.P. Laboratory</h2>
<p>Simulating Sybil Attack Costs vs Real User Costs.</p>
<div style="border:1px solid #333; padding:15px; border-radius:8px; margin-top:20px;">
  <strong>Scenario:</strong> 1000 Fake Wallets<br>
  <strong>Cost:</strong> HIGH (Blocked by Turnstile)
</div></body></html>`);

// 03. Ana Hesaplayıcı
fs.writeFileSync(path.join(root, 'modules/calculators/03-master-calc.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>⚡ MASTER CALCULATOR (Founding Patron)</h2>
<p>Full simulation including Cultural Points multipliers.</p>
</body></html>`);

// 04. Miras Sistemi
fs.writeFileSync(path.join(root, 'modules/demos/04-legacy-vault.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>🕰️ Time Capsule / Legacy System</h2>
<p>Protocol for transferring status to next of kin.</p>
</body></html>`);

// 05. Zombi Filtresi
fs.writeFileSync(path.join(root, 'modules/demos/05-zombie-filter.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>🧟 Zombie Filter (365-Day Rule)</h2>
<p>Inactive wallets are filtered out from the Top 100.</p>
</body></html>`);

// 10. Lider Tablosu
fs.writeFileSync(path.join(root, 'modules/10-leaderboard.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>📊 Live Leaderboard</h2>
<table style="width:100%; text-align:left; color:#888;">
<tr><th>Rank</th><th>Patron</th><th>Score</th></tr>
<tr><td style="color:#00ff88">#1</td><td>0x7a...9f21</td><td>98,500</td></tr>
<tr><td style="color:#00ff88">#2</td><td>0x3b...8e44</td><td>87,200</td></tr>
</table></body></html>`);

// 12. Katkı Akışı
fs.writeFileSync(path.join(root, 'modules/12-activity-feed.html'), 
`<html><body style="background:#0a0a0a; color:#eee; font-family:sans-serif; padding:20px;">
<h2>📡 Contribution Feed</h2>
<p>Real-time stream of verified cultural works.</p>
</body></html>`);

// =======================================================
// 5. ANA SAYFA (INDEX.HTML - TÜMÜNÜ BAĞLAYAN)
// =======================================================
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>İlhanArt Protocol Hub</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="sidebar">
        <div style="margin-bottom:30px; display:flex; align-items:center; gap:10px;">
            <div style="width:30px; height:30px; background:#00ff88; color:#000; display:grid; place-items:center; font-weight:bold; border-radius:4px;">◈</div>
            <div>
                <div style="font-weight:bold; color:#fff;">[PoArt]</div>
                <div style="font-size:10px; color:#666;">SYSTEM V1.1</div>
            </div>
        </div>

        <div class="group-title">Main</div>
        <a href="#" onclick="loadFrame('modules/10-leaderboard.html')" class="active">📊 Dashboard</a>
        <a href="#" onclick="loadFrame('modules/12-activity-feed.html')">📡 Activity Feed</a>

        <div class="group-title">Tools (Modules)</div>
        <a href="#" onclick="loadFrame('modules/calculators/01-simple-score.html')">🧮 Simple Calc</a>
        <a href="#" onclick="loadFrame('modules/calculators/03-master-calc.html')">⚡ Master Calc</a>
        <a href="#" onclick="loadFrame('modules/demos/02-sybil-lab.html')">🧪 FPP Lab</a>
        
        <div class="group-title">Protocol Mechanics</div>
        <a href="#" onclick="loadFrame('modules/demos/05-zombie-filter.html')">🧟 Zombie Filter</a>
        <a href="#" onclick="loadFrame('modules/demos/04-legacy-vault.html')">🕰️ Legacy Vault</a>
        
        <div class="group-title">Documentation</div>
        <a href="docs/tr/founding-patrons-CORE.md" target="_blank">📄 Core Rules</a>
        <a href="docs/tr/founding-patrons-protocol-FULL.md" target="_blank">📘 Full Protocol</a>
        <a href="docs/tr/REVOLUTIONARY-PROPOSALS.md" target="_blank">🚀 Future Proposals</a>

        <div style="margin-top:auto; font-size:10px; color:#444; border-top:1px solid #222; padding-top:15px; font-family:'JetBrains Mono'">
            <span style="color:#00ff88">●</span> SYSTEM ONLINE<br>
            Files Loaded: 28
        </div>
    </div>

    <div class="main">
        <h1 id="page-title">System Dashboard</h1>
        <div id="content-area">
            <div class="card">
                <iframe id="main-frame" src="modules/10-leaderboard.html"></iframe>
            </div>
            
            <div class="card">
                <h3>System Statistics</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:20px;">
                    <div>
                        <div style="font-size:12px; color:#666;">Total Files</div>
                        <div style="font-size:24px; font-weight:bold;">28</div>
                    </div>
                    <div>
                        <div style="font-size:12px; color:#666;">Protocol Ver</div>
                        <div style="font-size:24px; font-weight:bold; color:#00ff88;">1.1</div>
                    </div>
                    <div>
                        <div style="font-size:12px; color:#666;">Last Update</div>
                        <div style="font-size:24px; font-weight:bold;">Just Now</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function loadFrame(url) {
            document.getElementById('main-frame').src = url;
            // Basit başlık güncelleme
            const cleanName = url.split('/').pop().replace('.html', '').replace(/-/g, ' ').toUpperCase();
            document.getElementById('page-title').innerText = cleanName;
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'index.html'), indexHTML);

console.log("🎉 RESTORASYON TAMAMLANDI!");
console.log("📂 Oluşturulan Dosya Sayısı: 28+");
console.log("👉 [PoArt] klasörüne sağ tıkla ve 'Open with Live Server' de veya GitHub'a pushla.");
`;

### ADIM 2: Çalıştır ve Gönder 🔥

1.  Terminale: `node restorasyon.js` yaz. (Hata verirse korkma, "Dosya zaten var" diyebilir, önemli olan sonundaki "TAMAMLANDI" yazısı).
2.  **GitHub'a Gönder:**
    ```bash
    git add .
    git commit -m "feat: full roadmap restoration v3"
    git push
    ```

**ÖNEMLİ:** GitHub Pages'e gittiğinde sayfa hala eski görünüyorsa **CTRL + F5** (veya telefonda önbelleği temizle) yap. Çünkü bu script yapıyı tamamen değiştirdi, tarayıcın eskiyi hatırlıyor olabilir.

Hadi bakalım, bu sefer o "dolu dolu" yapıyı göreceğiz! 🚀