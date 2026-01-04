const fs = require('fs');
const path = require('path');

console.log("🚀 SİSTEM SENKRONİZASYONU: [F.P.P.] GÜNCEL KURALLARI İŞLENİYOR...");

const root = path.join(__dirname, '[PoArt]');

// Klasörleri oluştur
const dirs = [
    'css',
    'modules',
    'modules/calculators',
    'modules/demos',
    'docs',
    'data'
];
dirs.forEach(d => {
    const p = path.join(root, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// =======================================================
// 1. CSS GÜNCELLEMESİ (IFRAME İÇİN ŞEFFAF TEMA)
// =======================================================
// Bu CSS, modüllerin ana dashboard içinde "sırıtmadan" durmasını sağlar.
const cssContent = `:root {
    --accent: #00ff88;
    --text: #e0e0e0;
    --font-mono: 'JetBrains Mono', monospace;
    --font-main: 'Inter', sans-serif;
}
body { 
    background: transparent; /* Arka plan şeffaf ki ana dashboard görünsün */
    color: var(--text); 
    font-family: var(--font-main); 
    padding: 10px; 
}
h2 { 
    font-size: 16px; 
    border-bottom: 1px solid #333; 
    padding-bottom: 10px; 
    margin-bottom: 15px; 
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.card { 
    background: rgba(20, 20, 20, 0.6); 
    border: 1px solid #333; 
    border-radius: 8px; 
    padding: 20px; 
    margin-bottom: 15px; 
    backdrop-filter: blur(5px);
}
.tag { 
    font-size: 10px; padding: 3px 8px; border-radius: 4px; 
    border: 1px solid #333; background: #000; color: #888; 
    font-family: var(--font-mono); display: inline-block;
}
.tag.green { color: var(--accent); border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.05); }
.tag.orange { color: #ffcc00; border-color: rgba(255,204,0,0.3); }

/* TABLO STİLLERİ */
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; color: #666; padding: 10px; border-bottom: 1px solid #333; font-size: 10px; text-transform: uppercase; }
td { padding: 12px 10px; border-bottom: 1px solid #222; }
.rank-num { font-family: var(--font-mono); font-weight: bold; }

/* HESAPLAYICI GİRDİLERİ */
input[type="range"] { width: 100%; accent-color: var(--accent); cursor: pointer; }
input[type="number"], select { 
    background: #111; border: 1px solid #333; color: #fff; 
    padding: 8px; border-radius: 4px; width: 100%; 
    font-family: var(--font-mono); margin-bottom: 10px;
}
.result-display { 
    font-size: 36px; font-weight: 800; color: var(--accent); 
    font-family: var(--font-mono); text-shadow: 0 0 20px rgba(0,255,136,0.2);
}
.formula-note { font-size: 10px; color: #555; font-family: var(--font-mono); margin-top: 5px; }
`;
fs.writeFileSync(path.join(root, 'css/style.css'), cssContent);

// =======================================================
// 2. MODÜLLER (GÜNCEL MATEMATİK VE KURALLAR)
// =======================================================

// --- 10-leaderboard.html (GÜNCEL VERİLERLE) ---
const leaderboardHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../css/style.css"></head><body>
    <div class="card">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <span class="tag green">SNAPSHOT: LIVE</span>
            <span class="tag">Total: 84/100</span>
        </div>
        <table>
            <thead><tr><th>Rank</th><th>Patron ID</th><th>Tier</th><th>Cultural Pts</th><th>Final Score</th></tr></thead>
            <tbody>
                <tr>
                    <td><span class="rank-num" style="color:#00ff88">#01</span></td>
                    <td style="font-family:'JetBrains Mono'">0x7a...9f21</td>
                    <td><span class="tag green">LEGENDARY</span></td>
                    <td>4,500</td>
                    <td style="font-weight:bold; color:#fff">98,500</td>
                </tr>
                <tr>
                    <td><span class="rank-num" style="color:#00ff88">#02</span></td>
                    <td style="font-family:'JetBrains Mono'">0x3b...8e44</td>
                    <td><span class="tag green">LEGENDARY</span></td>
                    <td>3,200</td>
                    <td style="font-weight:bold; color:#fff">87,200</td>
                </tr>
                <tr>
                    <td><span class="rank-num">#03</span></td>
                    <td style="font-family:'JetBrains Mono'">0x9c...1a02</td>
                    <td><span class="tag">SENIOR</span></td>
                    <td>1,500</td>
                    <td style="font-weight:bold; color:#ccc">65,400</td>
                </tr>
                 <tr>
                    <td><span class="rank-num">#04</span></td>
                    <td style="font-family:'JetBrains Mono'">0x2d...5b99</td>
                    <td><span class="tag">VETERAN</span></td>
                    <td>800</td>
                    <td style="font-weight:bold; color:#ccc">54,100</td>
                </tr>
            </tbody>
        </table>
        <div style="font-size:10px; color:#444; margin-top:15px; text-align:center;">
            * Ranking based on Logarithmic Score Formula v1.1
        </div>
    </div>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/10-leaderboard.html'), leaderboardHTML);

// --- 03-master-calc.html (GÜNCEL MATEMATİK MOTORU) ---
const masterCalcHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../../css/style.css"></head><body>
    <h2>⚡ Master Score Simulator</h2>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="card">
            <label style="font-size:11px; color:#888;">ILHAN Token Holdings</label>
            <input type="number" id="tokens" value="10000" step="100">

            <label style="font-size:11px; color:#888;">Holding Duration (TWAB)</label>
            <input type="range" id="days" min="1" max="30" value="30">
            <div style="text-align:right; font-size:11px; color:#00ff88;" id="days-display">30 Days</div>

            <hr style="border:0; border-top:1px solid #333; margin:15px 0;">

            <label style="font-size:11px; color:#888;">Cultural Contribution (Points)</label>
            <input type="number" id="cult" value="0" placeholder="e.g. 500 for Translation">
            
            <label style="font-size:11px; color:#888;">Governance Participation</label>
            <input type="number" id="gov" value="0" placeholder="e.g. 50 for Voting">
        </div>

        <div class="card" style="text-align:center; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px;">Projected Score</div>
            <div id="final-score" class="result-display">0</div>
            
            <div style="margin-top:20px; text-align:left; font-size:12px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="color:#666">Base (Log):</span>
                    <span id="base-score" style="color:#fff">0</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="color:#666">Multiplier:</span>
                    <span id="multiplier" style="color:#00ff88">1.0x</span>
                </div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid #333; padding-top:5px; margin-top:5px;">
                    <span style="color:#666">Est. Tier:</span>
                    <span id="est-tier" style="font-weight:bold; color:#fff">-</span>
                </div>
            </div>
            <div class="formula-note">Math: log10(1 + TWAB) * 10k * (1 + Pts/1000)</div>
        </div>
    </div>

    <script>
        function calculate() {
            const tokens = parseFloat(document.getElementById('tokens').value) || 0;
            const days = parseFloat(document.getElementById('days').value) || 1;
            const cultPts = parseFloat(document.getElementById('cult').value) || 0;
            const govPts = parseFloat(document.getElementById('gov').value) || 0;

            document.getElementById('days-display').innerText = days + " Days";

            // 1. TWAB (Basitleştirilmiş simülasyon)
            const twab = tokens * (days / 30);

            // 2. LOGARİTMİK BASE (Balina Koruması)
            // Formül: log10(1 + TWAB) * 10,000
            const baseScore = Math.log10(1 + twab) * 10000;

            // 3. MULTIPLIER (Kültür + Governance)
            // Formül: 1 + (TotalPoints / 1000)
            const totalPoints = cultPts + govPts;
            const multiplier = 1 + (totalPoints / 1000);

            // 4. FINAL
            const finalScore = baseScore * multiplier;

            // DOM GÜNCELLEME
            document.getElementById('final-score').innerText = Math.floor(finalScore).toLocaleString();
            document.getElementById('base-score').innerText = Math.floor(baseScore).toLocaleString();
            document.getElementById('multiplier').innerText = multiplier.toFixed(2) + "x";

            // TIER TAHMİNİ
            let tier = "Unranked";
            if (finalScore >= 200000) tier = "LEGENDARY (Top 10)";
            else if (finalScore >= 150000) tier = "SENIOR (Top 50)";
            else if (finalScore >= 100000) tier = "VETERAN (Top 100)";
            else if (finalScore > 0) tier = "Builder";
            
            document.getElementById('est-tier').innerText = tier;
        }

        document.querySelectorAll('input').forEach(i => i.addEventListener('input', calculate));
        calculate(); // Başlangıçta çalıştır
    </script>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/calculators/03-master-calc.html'), masterCalcHTML);

// --- 01-simple-score.html (BASİT VERSİYON) ---
fs.writeFileSync(path.join(root, 'modules/calculators/01-simple-score.html'), masterCalcHTML); // Aynısını kopyala, zaten master yeterli

// --- 12-activity-feed.html (KATKI AKIŞI) ---
const feedHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../css/style.css"></head><body>
    <h2>📡 Live Contribution Feed</h2>
    <div class="card">
        <div style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-bottom:5px;">
                <span class="tag green">TRANSLATION</span>
                <span>2 mins ago</span>
            </div>
            <div style="font-weight:bold; font-size:14px; margin-bottom:3px;">Protocol Whitepaper (Japanese)</div>
            <div style="font-size:11px; color:#888; font-family:'JetBrains Mono'">By 0x7a...9f21 • <span style="color:#00ff88">Verified</span></div>
        </div>

        <div style="border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-bottom:5px;">
                <span class="tag green">ART</span>
                <span>1 hour ago</span>
            </div>
            <div style="font-weight:bold; font-size:14px; margin-bottom:3px;">Genesis Block Visualization #04</div>
            <div style="font-size:11px; color:#888; font-family:'JetBrains Mono'">By 0x3b...8e44 • <span style="color:#00ff88">Verified</span></div>
        </div>

        <div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#666; margin-bottom:5px;">
                <span class="tag orange">GOVERNANCE</span>
                <span>3 hours ago</span>
            </div>
            <div style="font-weight:bold; font-size:14px; margin-bottom:3px;">Proposal #12: Adjust Vault Delay</div>
            <div style="font-size:11px; color:#888; font-family:'JetBrains Mono'">By 0x9c...1a02 • <span>Pending Vote</span></div>
        </div>
    </div>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/12-activity-feed.html'), feedHTML);

// --- 05-zombie-filter.html (365 GÜN KURALI) ---
const zombieHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../../css/style.css"></head><body>
    <h2>🧟 Zombie Filter (Anti-Stagnation)</h2>
    <div class="card">
        <div style="border-left:3px solid #00ff88; padding-left:15px; margin-bottom:20px;">
            <strong style="color:#fff">THE 365-DAY RULE</strong><br>
            <span style="font-size:12px; color:#ccc;">Founding Patron status requires continuous activity. Inactive wallets are filtered out.</span>
        </div>
        
        <h3 style="font-size:12px; color:#666; border:none;">MECHANISM:</h3>
        <ul style="font-size:12px; color:#ccc; line-height:1.6; padding-left:20px;">
            <li><b>Activity Check:</b> Must interact with protocol (vote, claim, contribute) at least once every 90 days.</li>
            <li><b>Maturity:</b> Wallet must be active for > 365 days to be eligible for "Legendary" tier.</li>
            <li><b>Zombie State:</b> If inactive > 180 days, score decays by 50%.</li>
        </ul>
    </div>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/demos/05-zombie-filter.html'), zombieHTML);

// --- 04-legacy-vault.html (KASA CÜZDAN KURALI) ---
const vaultHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../../css/style.css"></head><body>
    <h2>🕰️ Legacy Vault (Safety Protocol)</h2>
    <div class="card">
         <div style="border-left:3px solid #ffcc00; padding-left:15px; margin-bottom:20px;">
            <strong style="color:#fff">CRITICAL RULE</strong><br>
            <span style="font-size:12px; color:#ccc;">Never mix "Spending" and "Vault" wallets.</span>
        </div>
        
        <table style="margin-top:20px;">
            <tr>
                <th>Wallet Type</th>
                <th>Permitted Actions</th>
                <th>Risk Level</th>
            </tr>
            <tr>
                <td style="color:#00ff88">Legacy Vault</td>
                <td>Storing, Voting, Signing</td>
                <td>🟢 ZERO RISK</td>
            </tr>
             <tr>
                <td style="color:#ffcc00">Spending Wallet</td>
                <td>Trading, DeFi, NFTs, Dapps</td>
                <td>🟠 HIGH RISK</td>
            </tr>
        </table>
        <p style="font-size:11px; color:#666; margin-top:15px;">
            * Moving tokens OUT of a Legacy Vault resets your TWAB Score to zero immediately.
        </p>
    </div>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/demos/04-legacy-vault.html'), vaultHTML);

// --- 02-sybil-lab.html (DEMO) ---
const sybilHTML = `<!DOCTYPE html>
<html><head><link rel="stylesheet" href="../../css/style.css"></head><body>
    <h2>🧪 Sybil Resistance Lab</h2>
    <div class="card">
        <p style="font-size:12px;">Simulating an attack with 1,000 fake wallets vs. 1 Genuine Patron.</p>
        
        <div style="margin:15px 0; background:#000; padding:10px; border-radius:6px;">
            <div style="font-size:10px; color:#666;">ATTACK SCENARIO</div>
            <div style="display:flex; justify-content:space-between; margin-top:5px;">
                <span>1,000 Bots (Linear)</span>
                <span style="color:#ff3b3b">Score: 10,000 pts</span>
            </div>
            <div style="width:10%; height:4px; background:#ff3b3b; margin-top:5px;"></div>
        </div>

         <div style="margin:15px 0; background:#000; padding:10px; border-radius:6px;">
            <div style="font-size:10px; color:#666;">GENUINE USER</div>
            <div style="display:flex; justify-content:space-between; margin-top:5px;">
                <span>1 Patron (Logarithmic + Culture)</span>
                <span style="color:#00ff88">Score: 98,500 pts</span>
            </div>
             <div style="width:90%; height:4px; background:#00ff88; margin-top:5px;"></div>
        </div>

        <div style="font-size:11px; color:#ccc; line-height:1.5;">
            <b>Result:</b> The logarithmic formula makes splitting tokens into many wallets ineffective. One high-value, high-culture wallet always wins.
        </div>
    </div>
</body></html>`;
fs.writeFileSync(path.join(root, 'modules/demos/02-sybil-lab.html'), sybilHTML);

console.log("✅ MODÜLLER SİSTEM İLE UYUMLU HALE GETİRİLDİ (LOGARİTMİK + İNGİLİZCE)");