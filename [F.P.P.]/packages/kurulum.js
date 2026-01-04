const fs = require('fs');
const path = require('path');

console.log("🚀 INITIALIZING: [PoArt] Dashboard V2 (Premium System Edition)...");

// Hedef Klasör: [PoArt]
const targetDir = path.join(__dirname, '[PoArt]');

// Temizlik ve Hazırlık
if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir);
fs.mkdirSync(path.join(targetDir, 'css'));
fs.mkdirSync(path.join(targetDir, 'js'));

// ==========================================
// 1. INDEX.HTML (Sistem Arayüzü)
// ==========================================
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İlhanArt Protocol | [PoArt] Registry</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="app-layout">
    <nav class="sidebar">
        <div class="brand">
            <div class="logo-box">◈</div>
            <div class="brand-info">
                <h2>[PoArt]</h2>
                <span>PROTOCOL v1.1</span>
            </div>
        </div>

        <div class="menu-group">SYSTEM</div>
        <button class="nav-item active" onclick="switchTab('dashboard')">
            <span>📊</span> Dashboard
        </button>
        <button class="nav-item" onclick="switchTab('leaderboard')">
            <span>🏆</span> Leaderboard
        </button>
        <button class="nav-item" onclick="switchTab('registry')">
            <span>📜</span> Registry Feed
        </button>

        <div class="menu-group">TOOLS</div>
        <button class="nav-item" onclick="switchTab('calculator')">
            <span>🧮</span> Score Calc
        </button>
        <button class="nav-item" onclick="switchTab('verification')">
            <span>🛡️</span> Verify Proof
        </button>

        <div class="status-panel">
            <div class="indicator">
                <div class="led blink"></div> SYSTEM ONLINE
            </div>
            <div class="block-num">Block: <span id="block-height">249,102,441</span></div>
        </div>
    </nav>

    <main class="main-content">
        <header>
            <div class="title-area">
                <h1 id="page-title">Founding Patron Dashboard</h1>
                <p>Time-Weighted Average Balance & Cultural Contribution System</p>
            </div>
            <div class="wallet-area">
                <button class="connect-btn">Connect Wallet</button>
            </div>
        </header>

        <div id="tab-dashboard" class="view-section active">
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="label">Total Patrons</div>
                    <div class="value">84<small>/100</small></div>
                </div>
                <div class="kpi-card">
                    <div class="label">Network TWAB</div>
                    <div class="value">4.2M</div>
                    <div class="sub">30-Day Avg</div>
                </div>
                <div class="kpi-card">
                    <div class="label">Verified Proofs</div>
                    <div class="value">1,204</div>
                    <div class="sub">On-Chain</div>
                </div>
            </div>

            <div class="content-grid">
                <div class="panel main-chart">
                    <div class="panel-head">
                        <h3>Protocol Activity</h3>
                        <span class="tag">Real-time</span>
                    </div>
                    <div class="chart-visual">
                        <div class="bar" style="height:40%"></div>
                        <div class="bar" style="height:70%"></div>
                        <div class="bar" style="height:50%"></div>
                        <div class="bar" style="height:80%"></div>
                        <div class="bar" style="height:60%"></div>
                        <div class="bar" style="height:90%"></div>
                    </div>
                </div>
                
                <div class="panel side-chart">
                    <div class="panel-head">
                        <h3>Vesting Cycle</h3>
                    </div>
                    <div class="vesting-visual">
                        <div class="circle-chart">
                            <svg viewBox="0 0 36 36">
                                <path class="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <path class="meter" stroke-dasharray="25, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            </svg>
                            <div class="percent">25%</div>
                        </div>
                        <div class="vesting-label">Year 1 Active</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="tab-leaderboard" class="view-section">
            <div class="panel">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Patron ID</th>
                            <th>Tier</th>
                            <th>Cultural Pts</th>
                            <th>Final Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-rows"></tbody>
                </table>
            </div>
        </div>

        <div id="tab-registry" class="view-section">
            <div class="feed-list" id="registry-feed"></div>
        </div>

        <div id="tab-calculator" class="view-section">
            <div class="calc-container">
                <div class="panel input-panel">
                    <h3>Simulation Inputs</h3>
                    <div class="form-group">
                        <label>ILHAN Token Balance</label>
                        <input type="number" id="calc-tokens" value="10000">
                    </div>
                    <div class="form-group">
                        <label>Holding Duration (TWAB)</label>
                        <input type="range" id="calc-days" min="1" max="30" value="30">
                        <span id="day-val">30 Days</span>
                    </div>
                    <div class="form-group">
                        <label>Cultural Contribution (Points)</label>
                        <input type="number" id="calc-culture" value="0">
                        <small>Translation, Art, Education (High Weight)</small>
                    </div>
                </div>
                <div class="panel output-panel">
                    <h3>Projected Score</h3>
                    <div class="score-display" id="calc-score">0</div>
                    <div class="math-breakdown">
                        <p>Base Score: <span id="calc-base">0</span></p>
                        <p>Multiplier: <span id="calc-mult">1.0x</span></p>
                    </div>
                    <div class="rank-est">Est. Rank: <span id="calc-rank">-</span></div>
                </div>
            </div>
        </div>

    </main>
</div>
<script src="js/app.js"></script>
</body>
</html>`;

// ==========================================
// 2. STYLE.CSS (Siyah/Yeşil Premium)
// ==========================================
const styleCSS = `:root {
    --bg: #050505;
    --panel: #0a0a0a;
    --border: #222;
    --accent: #00ff88;
    --accent-glow: rgba(0, 255, 136, 0.15);
    --text: #e0e0e0;
    --muted: #666;
    --font: 'Inter', sans-serif;
    --mono: 'JetBrains Mono', monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: var(--font); height: 100vh; overflow: hidden; }

.app-layout { display: flex; height: 100%; }

/* Sidebar */
.sidebar { width: 250px; background: var(--panel); border-right: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; }
.brand { display: flex; gap: 10px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.logo-box { width: 32px; height: 32px; background: var(--accent); color: #000; display: grid; place-items: center; font-weight: bold; border-radius: 4px; }
.brand-info h2 { font-size: 16px; margin: 0; }
.brand-info span { font-size: 10px; color: var(--muted); font-family: var(--mono); }

.menu-group { font-size: 10px; color: var(--muted); margin: 15px 0 5px; font-family: var(--mono); }
.nav-item { background: none; border: none; color: var(--muted); width: 100%; text-align: left; padding: 10px; cursor: pointer; display: flex; gap: 10px; border-radius: 6px; transition: 0.2s; font-family: var(--font); }
.nav-item:hover { color: #fff; background: #111; }
.nav-item.active { background: var(--accent-glow); color: var(--accent); border: 1px solid rgba(0,255,136,0.2); }

.status-panel { margin-top: auto; font-family: var(--mono); font-size: 10px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 15px; }
.indicator { display: flex; align-items: center; gap: 6px; color: var(--accent); margin-bottom: 4px; }
.led { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 5px var(--accent); animation: pulse 2s infinite; }
@keyframes pulse { 0%{opacity:1} 50%{opacity:0.3} 100%{opacity:1} }

/* Main Content */
.main-content { flex: 1; padding: 30px; overflow-y: auto; background: radial-gradient(circle at top right, #0f120f 0%, #050505 40%); }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
header h1 { font-size: 24px; font-weight: 600; }
header p { color: var(--muted); font-size: 13px; margin-top: 5px; }
.connect-btn { background: transparent; border: 1px solid var(--accent); color: var(--accent); padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: var(--mono); font-size: 12px; transition: 0.3s; }
.connect-btn:hover { background: var(--accent); color: #000; box-shadow: 0 0 15px var(--accent-glow); }

/* Views */
.view-section { display: none; animation: fadeIn 0.3s ease; }
.view-section.active { display: block; }
@keyframes fadeIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }

/* Dashboard Widgets */
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
.kpi-card { background: var(--panel); border: 1px solid var(--border); padding: 20px; border-radius: 8px; }
.kpi-card .label { font-size: 12px; color: var(--muted); }
.kpi-card .value { font-size: 28px; font-weight: 700; color: #fff; margin: 5px 0; }
.kpi-card .sub { font-size: 11px; color: var(--accent); }

.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
.panel-head { display: flex; justify-content: space-between; margin-bottom: 20px; }
.panel-head h3 { font-size: 16px; font-weight: 500; }
.tag { font-size: 10px; background: #111; padding: 4px 8px; border-radius: 4px; color: var(--muted); border: 1px solid #333; }

.chart-visual { height: 150px; display: flex; align-items: flex-end; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 5px; }
.bar { flex: 1; background: linear-gradient(to top, var(--accent-glow), var(--accent)); opacity: 0.6; border-radius: 4px 4px 0 0; transition: 0.3s; }
.bar:hover { opacity: 1; }

.vesting-visual { display: flex; flex-direction: column; align-items: center; }
.circle-chart { width: 120px; position: relative; }
.bg { fill: none; stroke: #222; stroke-width: 2.8; }
.meter { fill: none; stroke: var(--accent); stroke-width: 2.8; stroke-linecap: round; animation: progress 1s ease-out forwards; }
.percent { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: var(--accent); }
.vesting-label { margin-top: 15px; font-size: 12px; color: var(--muted); }

/* Leaderboard */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 11px; color: var(--muted); padding: 10px; border-bottom: 1px solid var(--border); text-transform: uppercase; }
.data-table td { padding: 15px 10px; border-bottom: 1px solid #151515; font-size: 13px; }
.rank-1 { color: var(--accent); font-weight: bold; }

/* Registry Feed */
.feed-row { background: #0e0e0e; border-left: 2px solid var(--border); padding: 15px; margin-bottom: 10px; transition: 0.2s; }
.feed-row:hover { background: #111; border-left-color: var(--accent); }
.feed-top { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 5px; font-family: var(--mono); }
.feed-main { font-weight: 600; font-size: 14px; }

/* Calculator */
.calc-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 8px; }
.form-group input { width: 100%; background: #111; border: 1px solid var(--border); color: #fff; padding: 12px; border-radius: 6px; outline: none; }
.form-group input:focus { border-color: var(--accent); }
.score-display { font-size: 40px; font-weight: 800; color: var(--accent); font-family: var(--mono); margin: 20px 0; }
.math-breakdown { font-size: 12px; color: var(--muted); line-height: 1.6; }
`;

// ==========================================
// 3. APP.JS (Mantık ve Mock Data)
// ==========================================
const appJS = `
// MOCK DATA
const ranking = [
    { rank: 1, id: "0x7a...9f21", tier: "Legendary", cult: 4500, score: 98500, status: "Active" },
    { rank: 2, id: "0x3b...8e44", tier: "Legendary", cult: 3200, score: 87200, status: "Active" },
    { rank: 3, id: "0x9c...1a02", tier: "Senior", cult: 1500, score: 65400, status: "Active" },
    { rank: 4, id: "0x2d...5b99", tier: "Senior", cult: 800, score: 54100, status: "Active" },
    { rank: 5, id: "0x5e...3c77", tier: "Veteran", cult: 200, score: 42000, status: "Grace" },
];

const feed = [
    { type: "Translation", title: "Protocol Whitepaper (JP)", user: "0x7a...9f21", time: "2h ago" },
    { type: "Art", title: "Genesis Block Viz", user: "0x3b...8e44", time: "5h ago" },
    { type: "Governance", title: "Vote on Proposal #12", user: "0x9c...1a02", time: "1d ago" },
];

function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    
    // Basit buton aktivasyonu
    const btn = Array.from(document.querySelectorAll('.nav-item')).find(b => b.onclick.toString().includes(tabId));
    if(btn) btn.classList.add('active');

    const titles = {
        'dashboard': 'Founding Patron Dashboard',
        'leaderboard': 'Global Ranking',
        'registry': 'Contribution Feed',
        'calculator': 'Score Simulator'
    };
    if(titles[tabId]) document.getElementById('page-title').innerText = titles[tabId];
}

function initLeaderboard() {
    const tbody = document.getElementById('leaderboard-rows');
    tbody.innerHTML = ranking.map(r => \`
        <tr>
            <td class="\${r.rank <= 3 ? 'rank-1' : ''}">#\${r.rank}</td>
            <td style="font-family:var(--mono)">\${r.id}</td>
            <td><span class="tag">\${r.tier}</span></td>
            <td style="color:var(--accent)">+\${r.cult}</td>
            <td style="font-weight:bold">\${r.score.toLocaleString()}</td>
            <td>\${r.status === 'Active' ? '🟢' : '🟠'}</td>
        </tr>
    \`).join('');
}

function initFeed() {
    const box = document.getElementById('registry-feed');
    box.innerHTML = feed.map(f => \`
        <div class="feed-row">
            <div class="feed-top">
                <span>\${f.type.toUpperCase()}</span>
                <span>\${f.time}</span>
            </div>
            <div class="feed-main">\${f.title}</div>
            <div style="font-size:11px; color:#555; margin-top:5px">By \${f.user}</div>
        </div>
    \`).join('');
}

function initCalc() {
    const tInput = document.getElementById('calc-tokens');
    const dInput = document.getElementById('calc-days');
    const cInput = document.getElementById('calc-culture');
    
    function calc() {
        const tokens = parseFloat(tInput.value) || 0;
        const days = parseFloat(dInput.value) || 1;
        const cult = parseFloat(cInput.value) || 0;
        
        document.getElementById('day-val').innerText = days + " Days";
        
        // LOGIC: TokenScore = log10(1 + TWAB) * 10000
        const twab = tokens * (days / 30);
        const base = Math.log10(1 + twab) * 10000;
        const mult = 1 + (cult / 1000);
        const final = base * mult;
        
        document.getElementById('calc-score').innerText = Math.floor(final).toLocaleString();
        document.getElementById('calc-base').innerText = Math.floor(base).toLocaleString();
        document.getElementById('calc-mult').innerText = mult.toFixed(2) + "x";
        
        let rank = "Unranked";
        if(final > 90000) rank = "Top 10 (Legendary)";
        else if(final > 20000) rank = "Top 100 (Veteran)";
        
        document.getElementById('calc-rank').innerText = rank;
    }
    
    [tInput, dInput, cInput].forEach(el => el.addEventListener('input', calc));
    calc();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initLeaderboard();
    initFeed();
    initCalc();
});
`;

fs.writeFileSync(path.join(targetDir, 'index.html'), indexHTML);
fs.writeFileSync(path.join(targetDir, 'css', 'style.css'), styleCSS);
fs.writeFileSync(path.join(targetDir, 'js', 'app.js'), appJS);

console.log("✅ PREMIUM DASHBOARD INSTALLED to [PoArt] folder.");
`;

// 3. Adım: Çalıştır ve Gönder
/*
    Terminale sırasıyla şunları yaz:
    1. node kurulum.js
    2. git add .
    3. git commit -m "feat: install premium poart dashboard"
    4. git push
*/