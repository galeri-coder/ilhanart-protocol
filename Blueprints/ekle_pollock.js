const fs = require('fs');
const path = require('path');

console.log("🎨 POLLOCK MODÜLÜ EKLENİYOR: CANLI AĞ HARİTASI...");

const root = path.join(__dirname, '[PoArt]');

// =======================================================
// 1. POLLOCK MODÜLÜ (AKTİF ÜYELER EKRANI)
// =======================================================
const pollockHTML = `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        /* Pollock'a Özel Efektler */
        .node-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20px, 1fr));
            gap: 8px;
            margin-bottom: 20px;
            padding: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
        }
        .node {
            width: 12px;
            height: 12px;
            background: #222;
            border-radius: 50%;
            transition: 0.3s;
        }
        .node.active {
            background: #00ff88;
            box-shadow: 0 0 10px #00ff88;
            animation: pulse 2s infinite;
        }
        .node.busy {
            background: #ffcc00;
            box-shadow: 0 0 5px #ffcc00;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
        .status-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #222;
            padding: 10px 0;
            font-size: 12px;
            font-family: 'JetBrains Mono', monospace;
        }
        .status-row:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <h2>🎨 Pollock (Active Nodes)</h2>
    
    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:15px;">
        <div class="card" style="text-align:center; padding:15px;">
            <div style="font-size:10px; color:#666;">ONLINE USERS</div>
            <div style="font-size:24px; font-weight:bold; color:#fff;">42</div>
        </div>
        <div class="card" style="text-align:center; padding:15px;">
            <div style="font-size:10px; color:#666;">NETWORK LOAD</div>
            <div style="font-size:24px; font-weight:bold; color:#00ff88;">12%</div>
        </div>
        <div class="card" style="text-align:center; padding:15px;">
            <div style="font-size:10px; color:#666;">LAST BLOCK</div>
            <div style="font-size:14px; font-weight:bold; color:#fff; margin-top:5px;">#249,102,445</div>
        </div>
    </div>

    <div class="card">
        <div style="font-size:10px; color:#666; margin-bottom:10px;">NODE VISUALIZER</div>
        <div class="node-grid" id="grid">
            </div>
    </div>

    <div class="card">
        <div style="font-size:10px; color:#666; margin-bottom:10px; text-transform:uppercase;">Recent Signals</div>
        <div class="status-row">
            <span><span class="tag green">ACTIVE</span> 0x7a...9f21</span>
            <span style="color:#666;">Calculating Score...</span>
        </div>
        <div class="status-row">
            <span><span class="tag green">ACTIVE</span> 0x3b...8e44</span>
            <span style="color:#666;">Voting on Proposal #12</span>
        </div>
        <div class="status-row">
            <span><span class="tag orange">BUSY</span> 0x9c...1a02</span>
            <span style="color:#666;">Syncing Ledger...</span>
        </div>
        <div class="status-row">
            <span><span class="tag green">ACTIVE</span> 0x2d...5b99</span>
            <span style="color:#666;">Viewing Dashboard</span>
        </div>
    </div>

    <script>
        // Rastgele Grid Oluşturma (Canlı hissi vermek için)
        const grid = document.getElementById('grid');
        for(let i=0; i<84; i++) {
            const div = document.createElement('div');
            div.className = 'node';
            
            // Rastgele aktiflik ata
            const rand = Math.random();
            if(rand > 0.8) div.classList.add('active');
            else if(rand > 0.7) div.classList.add('busy');
            
            grid.appendChild(div);
        }

        // Canlı değişim efekti
        setInterval(() => {
            const nodes = document.querySelectorAll('.node');
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            
            if(randomNode.classList.contains('active')) {
                randomNode.classList.remove('active');
            } else {
                randomNode.classList.add('active');
            }
        }, 500);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'modules/pollock.html'), pollockHTML);

// =======================================================
// 2. INDEX.HTML GÜNCELLEMESİ (MENÜYE EKLEME)
// =======================================================
// Mevcut index.html'i okuyup Pollock butonunu araya ekliyoruz.
// Riski azaltmak için index.html'i baştan yazıyoruz (En temiz yöntem).

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
        <button class="nav-btn" onclick="loadPage('modules/pollock.html', 'Jackson Pollock')">🎨 Active Nodes</button>
        
        <div class="menu-title">The Atelier (Tools)</div>
        <button class="nav-btn" onclick="loadPage('modules/davinci.html', 'Da Vinci')">📐 Calculator</button>
        <button class="nav-btn" onclick="loadPage('modules/picasso.html', 'Picasso')">🎭 Sybil Lab</button>
        
        <div class="menu-title">Philosophy (Rules)</div>
        <button class="nav-btn" onclick="loadPage('modules/dali.html', 'Dali')">🕰️ Time Filter</button>
        <button class="nav-btn" onclick="loadPage('modules/rembrandt.html', 'Rembrandt')">🌑 The Vault</button>

        <div class="footer-info"><span style="color:#00ff88">●</span> SYSTEM ONLINE<br>Block: 249,102,445</div>
    </div>

    <div class="main">
        <div class="top-bar"><h1 id="page-title">Michelangelo</h1><div style="font-size:10px; color:#666; font-family:monospace;">CONNECTED</div></div>
        <iframe id="app-frame" class="content-frame" src="modules/michelangelo.html"></iframe>
    </div>

    <script>
        function loadPage(u,t){
            document.getElementById('app-frame').src=u;
            document.getElementById('page-title').innerText=t;
            document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'index.html'), indexHTML);

console.log("✅ POLLOCK EKLENDİ VE MENÜ GÜNCELLENDİ!");