const fs = require('fs');
const path = require('path');

console.log("🎨 POLLOCK GÜNCELLENİYOR: DETAYLI AĞ ARAYÜZÜ YÜKLENİYOR...");

const root = path.join(__dirname, '[PoArt]');

// =======================================================
// YENİ GÜÇLÜ POLLOCK MODÜLÜ (INFO + VISUALIZER)
// =======================================================
const pollockHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        /* ÖZEL STİLLER (Referans Resimlerdeki Gibi) */
        .hero-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
        }
        .info-title {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-text {
            font-size: 12px;
            color: #888;
            line-height: 1.6;
        }
        .rule-box {
            border-left: 3px solid #ffcc00;
            background: rgba(255, 204, 0, 0.05);
            padding: 15px;
            margin-top: 15px;
            border-radius: 0 4px 4px 0;
        }
        .kpi-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        .kpi-card {
            background: #0e0e0e;
            border: 1px solid #222;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .kpi-val { font-size: 20px; font-weight: bold; color: #fff; font-family: 'JetBrains Mono'; }
        .kpi-lbl { font-size: 10px; color: #555; margin-top: 5px; text-transform: uppercase; }
        
        /* Görselleştirici (Eski Pollock Efekti Korundu) */
        .node-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(15px, 1fr));
            gap: 6px;
            padding: 15px;
            background: #000;
            border-radius: 8px;
            border: 1px solid #222;
            height: 150px;
            overflow: hidden;
        }
        .node { width: 8px; height: 8px; background: #222; border-radius: 50%; transition: 0.3s; }
        .node.active { background: #00ff88; box-shadow: 0 0 8px #00ff88; }
        .node.busy { background: #ffcc00; }
    </style>
</head>
<body>
    <h2>🎨 Jackson Pollock (Network State)</h2>

    <div class="hero-grid">
        <div class="info-box">
            <div class="info-title">
                <span class="tag green">LIVE</span>
                System Overview & Purpose
            </div>
            <p class="info-text">
                Welcome to the <strong>[PoArt] Network Visualizer</strong>. This dashboard provides a real-time heartbeat of the Founding Patrons Protocol. Unlike a static list, "Pollock" visualizes the chaotic yet synchronized activity of every active wallet (node) in the ecosystem.
            </p>
            <div class="rule-box">
                <strong style="color:#ffcc00; font-size:11px;">PROTOCOL RULE v1.1:</strong>
                <p style="font-size:11px; color:#ccc; margin-top:5px;">
                    "Active Presence" is defined as interacting with the contract at least once per epoch. Nodes that go silent (grey) for >90 days lose their governance weight.
                </p>
            </div>
        </div>
        
        <div class="info-box">
            <div class="info-title">Module Legend</div>
            <ul style="list-style:none; padding:0; margin:0;">
                <li style="margin-bottom:10px; font-size:11px; color:#ccc; display:flex; align-items:center; gap:10px;">
                    <span style="width:8px; height:8px; background:#00ff88; border-radius:50%; box-shadow:0 0 5px #00ff88"></span>
                    <div>
                        <strong>Active Node</strong>
                        <div style="font-size:9px; color:#666;">Validating / Voting</div>
                    </div>
                </li>
                <li style="margin-bottom:10px; font-size:11px; color:#ccc; display:flex; align-items:center; gap:10px;">
                    <span style="width:8px; height:8px; background:#ffcc00; border-radius:50%;"></span>
                    <div>
                        <strong>Busy / Syncing</strong>
                        <div style="font-size:9px; color:#666;">Processing Transaction</div>
                    </div>
                </li>
                <li style="font-size:11px; color:#ccc; display:flex; align-items:center; gap:10px;">
                    <span style="width:8px; height:8px; background:#333; border-radius:50%;"></span>
                    <div>
                        <strong>Dormant</strong>
                        <div style="font-size:9px; color:#666;">Offline > 24h</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>

    <div class="kpi-row">
        <div class="kpi-card">
            <div class="kpi-val" style="color:#00ff88">42</div>
            <div class="kpi-lbl">Active Nodes</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">12ms</div>
            <div class="kpi-lbl">Avg Latency</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">99.8%</div>
            <div class="kpi-lbl">Uptime</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">#249k</div>
            <div class="kpi-lbl">Block Height</div>
        </div>
    </div>

    <div class="info-box" style="margin-bottom:20px;">
        <div class="info-title">Global Node Map</div>
        <div class="node-grid" id="grid"></div>
        <div style="text-align:right; font-size:9px; color:#444; margin-top:5px; font-family:'JetBrains Mono'">RENDERING: CANVAS_MODE_V2</div>
    </div>

    <div class="info-box">
        <div class="info-title">System Logs</div>
        <table style="font-size:11px; color:#888;">
            <tr>
                <td style="color:#555; width:80px;">10:42:01</td>
                <td style="color:#00ff88">CONNECT</td>
                <td>Node 0x7a...9f21 established secure tunnel.</td>
            </tr>
            <tr>
                <td style="color:#555;">10:41:55</td>
                <td style="color:#ffcc00">SYNC</td>
                <td>Ledger update detected. Syncing blocks...</td>
            </tr>
            <tr>
                <td style="color:#555;">10:40:12</td>
                <td style="color:#00ff88">VOTE</td>
                <td>Consensus reached on Proposal #12.</td>
            </tr>
        </table>
    </div>

    <script>
        // Pollock Animasyon Motoru
        const grid = document.getElementById('grid');
        const totalNodes = 120;
        
        // Grid oluştur
        for(let i=0; i<totalNodes; i++) {
            const div = document.createElement('div');
            div.className = 'node';
            if(Math.random() > 0.7) div.classList.add('active');
            else if(Math.random() > 0.8) div.classList.add('busy');
            grid.appendChild(div);
        }

        // Rastgele yanıp sönme
        setInterval(() => {
            const nodes = document.querySelectorAll('.node');
            const target = nodes[Math.floor(Math.random() * nodes.length)];
            
            // Durum değiştir
            if(target.classList.contains('active')) {
                target.classList.remove('active');
                target.style.background = '#222';
            } else {
                target.classList.add('active');
            }
        }, 100);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'modules/pollock.html'), pollockHTML);
console.log("✅ POLLOCK ARAYÜZÜ YENİLENDİ: DAHA DOLU VE AÇIKLAYICI!");