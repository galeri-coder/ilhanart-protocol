const fs = require('fs');
const path = require('path');

console.log("🚑 KURTARMA OPERASYONU BAŞLADI: YANLIŞ KLASÖRLER TEMİZLENİYOR...");

// Hedef Doğru Klasör
const targetRoot = path.join(__dirname, '[PoArt]');

// 1. TEMİZLİK: Olası yanlış isimleri sil
const suspiciousFolders = [
    'PoArt', 'poart', 'POART', 
    'FPP', 'fpp', '[FPP]', 
    '[Poart]', 'poArt', 
    'modules', 'css' // Eğer ana dizine saçıldıysa bunları da temizle
];

suspiciousFolders.forEach(folder => {
    const wrongPath = path.join(__dirname, folder);
    // Hedef klasörün kendisi değilse sil
    if (folder !== '[PoArt]' && fs.existsSync(wrongPath)) {
        try {
            fs.rmSync(wrongPath, { recursive: true, force: true });
            console.log(`🗑️ Silindi: ${folder}`);
        } catch (e) {
            console.log(`⚠️ Silinemedi (Meşgul olabilir): ${folder}`);
        }
    }
});

// Eğer [PoArt] varsa onu da sıfırla ki taze kurulum olsun
if (fs.existsSync(targetRoot)) {
    fs.rmSync(targetRoot, { recursive: true, force: true });
}

// 2. YENİDEN KURULUM (SANATÇI VERSİYONU)
console.log("🏗️ DOĞRU KLASÖR ([PoArt]) İNŞA EDİLİYOR...");

const dirs = ['css', 'modules', 'docs', 'data'];
dirs.forEach(d => {
    const p = path.join(targetRoot, d);
    fs.mkdirSync(p, { recursive: true });
});

// --- CSS (Premium) ---
const cssContent = `:root { --accent: #00ff88; --text: #e0e0e0; --font-mono: 'JetBrains Mono', monospace; --font-main: 'Inter', sans-serif; }
body { background: transparent; color: var(--text); font-family: var(--font-main); padding: 10px; }
h2 { border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; color: #fff; text-transform: uppercase; letter-spacing: 2px; font-weight: 300; }
.card { background: rgba(20, 20, 20, 0.6); border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 15px; backdrop-filter: blur(5px); }
.tag { font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid #333; background: #000; color: #888; font-family: var(--font-mono); display: inline-block; }
.tag.green { color: var(--accent); border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.05); }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; color: #666; padding: 10px; border-bottom: 1px solid #333; font-size: 10px; text-transform: uppercase; }
td { padding: 12px 10px; border-bottom: 1px solid #222; }
input[type="range"] { width: 100%; accent-color: var(--accent); cursor: pointer; }
input[type="number"], select { background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; width: 100%; font-family: var(--font-mono); margin-bottom: 10px; }
.result-display { font-size: 36px; font-weight: 800; color: var(--accent); font-family: var(--font-mono); }`;
fs.writeFileSync(path.join(targetRoot, 'css/style.css'), cssContent);

// --- MODÜLLER (SANATÇILAR) ---

// Michelangelo
const michelangelo = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>🏛️ Michelangelo (The Ranking)</h2><div class="card"><div style="display:flex; justify-content:space-between; margin-bottom:15px;"><span class="tag green">LIVE SNAPSHOT</span><span class="tag">Total: 84/100</span></div>
<table><thead><tr><th>Rank</th><th>Patron ID</th><th>Tier</th><th>Cultural Pts</th><th>Final Score</th></tr></thead><tbody>
<tr><td><b style="color:#00ff88">#01</b></td><td style="font-family:'JetBrains Mono'">0x7a...9f21</td><td><span class="tag green">LEGENDARY</span></td><td>4,500</td><td><b>98,500</b></td></tr>
<tr><td><b style="color:#00ff88">#02</b></td><td style="font-family:'JetBrains Mono'">0x3b...8e44</td><td><span class="tag green">LEGENDARY</span></td><td>3,200</td><td><b>87,200</b></td></tr>
<tr><td><b>#03</b></td><td style="font-family:'JetBrains Mono'">0x9c...1a02</td><td><span class="tag">SENIOR</span></td><td>1,500</td><td><b>65,400</b></td></tr></tbody></table></div></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/michelangelo.html'), michelangelo);

// Da Vinci
const davinci = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>📐 Da Vinci (The Architect)</h2><div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
<div class="card"><label style="font-size:11px; color:#888;">ILHAN Token Holdings</label><input type="number" id="tokens" value="10000" step="100">
<label style="font-size:11px; color:#888;">Holding Duration (TWAB)</label><input type="range" id="days" min="1" max="30" value="30"><div style="text-align:right; font-size:11px; color:#00ff88;" id="days-display">30 Days</div>
<hr style="border:0; border-top:1px solid #333; margin:15px 0;"><label style="font-size:11px; color:#888;">Cultural Points</label><input type="number" id="cult" value="0"></div>
<div class="card" style="text-align:center; display:flex; flex-direction:column; justify-content:center;"><div style="font-size:11px; color:#666;">PROJECTED SCORE</div><div id="final-score" class="result-display">0</div>
<div style="margin-top:20px; text-align:left; font-size:12px;"><div style="display:flex; justify-content:space-between;"><span style="color:#666">Multiplier:</span><span id="multiplier" style="color:#00ff88">1.0x</span></div></div></div></div>
<script>function calculate(){const t=parseFloat(document.getElementById('tokens').value)||0;const d=parseFloat(document.getElementById('days').value)||1;const c=parseFloat(document.getElementById('cult').value)||0;
document.getElementById('days-display').innerText=d+" Days";const score=Math.log10(1+(t*(d/30)))*10000*(1+(c/1000));
document.getElementById('final-score').innerText=Math.floor(score).toLocaleString();document.getElementById('multiplier').innerText=(1+(c/1000)).toFixed(2)+"x";}
document.querySelectorAll('input').forEach(i=>i.addEventListener('input',calculate));calculate();</script></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/davinci.html'), davinci);

// Van Gogh
const vangogh = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>🌻 Van Gogh (Living Feed)</h2><div class="card">
<div style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-bottom:5px;"><span class="tag green">TRANSLATION</span><span>2 mins ago</span></div><div style="font-weight:bold; font-size:14px;">Protocol Whitepaper (Japanese)</div><div style="font-size:11px; color:#888;">By 0x7a...9f21 • <span style="color:#00ff88">Verified</span></div></div>
<div style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-bottom:5px;"><span class="tag green">ART</span><span>1 hour ago</span></div><div style="font-weight:bold; font-size:14px;">Genesis Block Visualization #04</div><div style="font-size:11px; color:#888;">By 0x3b...8e44 • <span style="color:#00ff88">Verified</span></div></div></div></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/vangogh.html'), vangogh);

// Dali
const dali = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>🕰️ Dali (Time Persistence)</h2><div class="card"><div style="border-left:3px solid #00ff88; padding-left:15px; margin-bottom:20px;"><strong style="color:#fff">THE 365-DAY RULE</strong><br><span style="font-size:12px; color:#ccc;">"Time is the ultimate filter."</span></div>
<ul style="font-size:12px; color:#ccc; line-height:1.6; padding-left:20px;"><li><b>Persistence:</b> Wallet must be active for > 365 days.</li><li><b>Zombie State:</b> If inactive > 180 days, score melts away (50% decay).</li></ul></div></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/dali.html'), dali);

// Rembrandt
const rembrandt = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>🌑 Rembrandt (The Vault)</h2><div class="card"><div style="border-left:3px solid #ffcc00; padding-left:15px; margin-bottom:20px;"><strong style="color:#fff">THE GOLDEN RULE</strong><br><span style="font-size:12px; color:#ccc;">Separate the Shadow (Vault) from the Light (Spending).</span></div>
<table style="margin-top:20px;"><tr><th>Wallet Type</th><th>Role</th><th>Risk</th></tr><tr><td style="color:#00ff88">Rembrandt Vault</td><td>Storage (Darkness)</td><td>🟢 ZERO</td></tr><tr><td style="color:#ffcc00">Spending Wallet</td><td>Trading (Light)</td><td>🟠 HIGH</td></tr></table></div></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/rembrandt.html'), rembrandt);

// Picasso
const picasso = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../css/style.css"></head><body>
<h2>🎭 Picasso (Multi-Face Lab)</h2><div class="card"><p style="font-size:12px;">Simulating: 1,000 Cubist Faces (Bots) vs. 1 Master.</p>
<div style="margin:15px 0; background:#000; padding:10px; border-radius:6px;"><div style="font-size:10px; color:#666;">1,000 FAKE FACES</div><div style="display:flex; justify-content:space-between; margin-top:5px;"><span>Linear Split</span><span style="color:#ff3b3b">Score: 10,000</span></div><div style="width:10%; height:4px; background:#ff3b3b; margin-top:5px;"></div></div>
<div style="margin:15px 0; background:#000; padding:10px; border-radius:6px;"><div style="font-size:10px; color:#666;">1 MASTERPIECE</div><div style="display:flex; justify-content:space-between; margin-top:5px;"><span>Logarithmic Holding</span><span style="color:#00ff88">Score: 98,500</span></div><div style="width:90%; height:4px; background:#00ff88; margin-top:5px;"></div></div></div></body></html>`;
fs.writeFileSync(path.join(targetRoot, 'modules/picasso.html'), picasso);

// INDEX.HTML (Bağlantılar)
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İlhanArt | [PoArt]</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg-dark: #050505; --panel: #0a0a0a; --border: #1a1a1a; --accent: #00ff88; --text: #e0e0e0; --font-main: 'Inter', sans-serif; --font-mono: 'JetBrains Mono', monospace; }
        body { background: var(--bg-dark); color: var(--text); font-family: var(--font-main); margin:0; padding:0; display:flex; height:100vh; overflow:hidden; }
        .sidebar { width:260px; background:var(--panel); border-right:1px solid var(--border); padding:20px; display:flex; flex-direction:column; overflow-y:auto; }
        .brand { display:flex; align-items:center; gap:10px; margin-bottom:30px; border-bottom:1px solid var(--border); padding-bottom:20px; }
        .logo { width:32px; height:32px; background:var(--accent); color:#000; display:grid; place-items:center; font-weight:bold; border-radius:4px; }
        .menu-title { font-size:10px; font-family:var(--font-mono); color:#444; margin:20px 0 10px; text-transform:uppercase; font-weight:bold; }
        .nav-btn { background: none; border: none; width: 100%; text-align: left; padding: 10px; margin: 2px 0; border-radius: 6px; color: #888; cursor: pointer; font-size: 13px; font-family: var(--font-main); transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .nav-btn:hover, .nav-btn.active { background: rgba(0,255,136,0.05); color: var(--accent); }
        .nav-btn.active { border-left: 2px solid var(--accent); }
        .main { flex:1; display: flex; flex-direction: column; background: radial-gradient(circle at top right, #0f150f 0%, #050505 40%); }
        .top-bar { padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        h1 { font-size: 18px; margin: 0; font-weight: 600; font-family: var(--font-mono); letter-spacing: -0.5px; }
        .content-frame { flex: 1; border: none; width: 100%; height: 100%; background: transparent; }
        .footer-info { margin-top: auto; font-size: 10px; color: #444; font-family: var(--font-mono); padding-top: 20px; border-top: 1px solid var(--border); }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="brand"><div class="logo">◈</div><div><div style="font-weight:700; color:#fff">[PoArt]</div><div style="font-size:10px; color:#666">PROTOCOL V1.1</div></div></div>
        <div class="menu-title">Masterpieces (Data)</div>
        <button class="nav-btn active" onclick="loadPage('modules/michelangelo.html', 'Michelangelo')">🏛️ Leaderboard</button>
        <button class="nav-btn" onclick="loadPage('modules/vangogh.html', 'Van Gogh')">🌻 Live Feed</button>
        <div class="menu-title">The Atelier (Tools)</div>
        <button class="nav-btn" onclick="loadPage('modules/davinci.html', 'Da Vinci')">📐 Calculator</button>
        <button class="nav-btn" onclick="loadPage('modules/picasso.html', 'Picasso')">🎭 Sybil Lab</button>
        <div class="menu-title">Philosophy (Rules)</div>
        <button class="nav-btn" onclick="loadPage('modules/dali.html', 'Dali')">🕰️ Time Filter</button>
        <button class="nav-btn" onclick="loadPage('modules/rembrandt.html', 'Rembrandt')">🌑 The Vault</button>
        <div class="footer-info"><span style="color:#00ff88">●</span> SYSTEM ONLINE<br>Block: 249,102,441</div>
    </div>
    <div class="main">
        <div class="top-bar"><h1 id="page-title">Michelangelo</h1><div style="font-size:10px; color:#666; font-family:monospace;">CONNECTED</div></div>
        <iframe id="app-frame" class="content-frame" src="modules/michelangelo.html"></iframe>
    </div>
    <script>function loadPage(u,t){document.getElementById('app-frame').src=u;document.getElementById('page-title').innerText=t;document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));event.currentTarget.classList.add('active');}</script>
</body></html>`;
fs.writeFileSync(path.join(targetRoot, 'index.html'), indexHTML);

console.log("✅ KURTARMA BAŞARILI: [PoArt] KLASÖRÜ TERTEMİZ VE SANATÇILARLA DOLU!");