const fs = require('fs');
const path = require('path');

// --- PROJE DOSYA YAPISI VE İÇERİKLERİ (V1.1 - Proof Run Eklendi) ---
const files = {
  // 1. GITHUB WORKFLOWS (INDEXER - OTOMATİK)
  '.github/workflows/indexer.yml': `name: Ilhan Art - FPP Indexer (Production)

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

concurrency:
  group: fpp-indexer
  cancel-in-progress: true

jobs:
  indexer:
    name: Run & Archive
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: "packages/indexer/package-lock.json"

      - name: Install Deps
        working-directory: packages/indexer
        run: npm ci

      - name: Run Sampling
        working-directory: packages/indexer
        env:
          RPC_URL: \${{ secrets.SOLANA_RPC_URL }}
          MINT: \${{ secrets.SPL_MINT_ADDRESS }}
        run: |
          set -euo pipefail          
          : "\${RPC_URL:?Missing secret SOLANA_RPC_URL}"
          : "\${MINT:?Missing secret SPL_MINT_ADDRESS}"

          NOW_TS=$(date -u +%s)
          ISO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

          echo "Starting sampling task at $ISO_DATE ($NOW_TS)..."

          mkdir -p ../../data

          npx ts-node src/cli.ts sample \\
            --rpc "$RPC_URL" \\
            --mint "$MINT" \\
            --db "../../data/fp.db" \\
            --ts "$NOW_TS"

          cat > ../../data/last_run.json <<EOF
          {
            "last_update": "$ISO_DATE",
            "timestamp": $NOW_TS,
            "mint": "$MINT",
            "status": "active",
            "system": "F.P.P. Indexer V1.0"
          }
          EOF

      - name: Upload DB Artifact
        uses: actions/upload-artifact@v4
        with:
          name: fpp-database-\${{ github.run_id }}
          path: data/fp.db
          if-no-files-found: error
          retention-days: 30

      - name: Commit Heartbeat
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore(status): update system heartbeat [skip ci]"
          file_pattern: "data/last_run.json"`,

  // 2. GITHUB WORKFLOWS (PROOF RUN - MANUEL) --- YENİ EKLENDİ ---
  '.github/workflows/proof_run.yml': `name: Ilhan Art - FPP Snapshot & Proof (Manual)
on:
  workflow_dispatch:
    inputs:
      wallet:
        description: "Wallet address to generate inclusion proof for"
        required: true
        type: string
      snapshot_id:
        description: "Snapshot ID (leave empty to use today's UTC date)"
        required: false
        type: string
      window_days:
        description: "TWAB window (days)"
        required: false
        default: "30"
        type: string
      base:
        description: "Contribution base"
        required: false
        default: "1000"
        type: string
      contrib_path:
        description: "Optional contributions JSON path (example: data/contributions.json)"
        required: false
        type: string

concurrency:
  group: fpp-proof-run
  cancel-in-progress: true

jobs:
  proof-run:
    name: Build Snapshot + Proof
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: "packages/indexer/package-lock.json"

      - name: Install Deps
        working-directory: packages/indexer
        run: npm ci

      - name: Run Pipeline (sample -> snapshot -> proof -> verify)
        working-directory: packages/indexer
        env:
          RPC_URL: \${{ secrets.SOLANA_RPC_URL }}
          MINT: \${{ secrets.SPL_MINT_ADDRESS }}
          WALLET: \${{ inputs.wallet }}
          SNAPSHOT_ID_INPUT: \${{ inputs.snapshot_id }}
          WINDOW_DAYS: \${{ inputs.window_days }}
          BASE: \${{ inputs.base }}
          CONTRIB_PATH: \${{ inputs.contrib_path }}
        run: |
          set -euo pipefail
          : "\${RPC_URL:?Missing secret SOLANA_RPC_URL}"
          : "\${MINT:?Missing secret SPL_MINT_ADDRESS}"
          : "\${WALLET:?Missing workflow input wallet}"

          NOW_TS=$(date -u +%s)
          ISO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

          SNAPSHOT_ID="\${SNAPSHOT_ID_INPUT:-}"
          if [ -z "$SNAPSHOT_ID" ]; then
            SNAPSHOT_ID=$(date -u +%F)
          fi

          mkdir -p ../../data ../../out

          echo "== Sampling =="
          npx ts-node src/cli.ts sample \\
            --rpc "$RPC_URL" \\
            --mint "$MINT" \\
            --db "../../data/fp.db" \\
            --ts "$NOW_TS"

          echo "== Snapshot =="
          SNAP_CMD=(npx ts-node src/cli.ts snapshot
            --db "../../data/fp.db"
            --out "../../out/snapshot.json"
            --snapshot-id "$SNAPSHOT_ID"
            --mint "$MINT"
            --snapshot-ts "$NOW_TS"
            --window-days "$WINDOW_DAYS"
            --base "$BASE"
          )

          if [ -n "\${CONTRIB_PATH:-}" ]; then
            SNAP_CMD+=(--contrib "$CONTRIB_PATH")
          fi

          "\${SNAP_CMD[@]}"

          echo "== Proof =="
          npx ts-node src/cli.ts proof \\
            --snapshot "../../out/snapshot.json" \\
            --wallet "$WALLET" \\
            --out "../../out/proof.json"

          echo "== Verify (strict) =="
          npx ts-node - <<'TS'
          import fs from "fs";
          import { verifyProof } from "./src/merkle";

          const snap = JSON.parse(fs.readFileSync("../../out/snapshot.json","utf8"));
          const proof = JSON.parse(fs.readFileSync("../../out/proof.json","utf8"));

          const entry = snap.entries.find((e: any) => e.wallet === proof.wallet);
          if (!entry) throw new Error("Wallet not found in snapshot entries");

          const ok = verifyProof({
            wallet: proof.wallet,
            finalScoreFixed: entry.final_score,
            proof: proof.proof,
            rootHex: proof.merkle_root
          });

          if (!ok) {
            console.error("FAIL: invalid proof");
            process.exit(1);
          }
          console.log("OK: proof valid");
          TS

          echo "== Write repo heartbeat (proof run) =="
          MERKLE_ROOT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('../../out/snapshot.json','utf8')).merkle_root)")
          cat > ../../data/last_proof_run.json <<EOF
          {
            "last_update": "$ISO_DATE",
            "timestamp": $NOW_TS,
            "mint": "$MINT",
            "snapshot_id": "$SNAPSHOT_ID",
            "wallet": "$WALLET",
            "merkle_root": "$MERKLE_ROOT",
            "status": "active",
            "system": "F.P.P. Proof Runner V1.0"
          }
          EOF

      - name: Upload Artifacts (DB + Snapshot + Proof)
        uses: actions/upload-artifact@v4
        with:
          name: fpp-proof-run-\${{ github.run_id }}
          path: |
            data/fp.db
            out/snapshot.json
            out/proof.json
          if-no-files-found: error
          retention-days: 30

      - name: Commit Proof Heartbeat
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore(status): update proof-run heartbeat [skip ci]"
          file_pattern: "data/last_proof_run.json"`,

  // 3. GITIGNORE (GÜNCELLENDİ)
  '.gitignore': `# Node
node_modules/
dist/
*.log

# OS
.DS_Store

# FPP data: keep heartbeats, ignore DB
data/*.db
!data/last_run.json
!data/last_proof_run.json

# Optional local outputs
out/
fp.db
*.sqlite`,

  // 4. DATA / LAST RUN JSON
  'data/last_run.json': `{
  "last_update": "1970-01-01T00:00:00Z",
  "timestamp": 0,
  "mint": "",
  "status": "inactive",
  "system": "F.P.P. Indexer V1.0"
}`,

  // 5. DATA / LAST PROOF RUN JSON --- YENİ EKLENDİ ---
  'data/last_proof_run.json': `{
  "last_update": "1970-01-01T00:00:00Z",
  "timestamp": 0,
  "mint": "",
  "snapshot_id": "",
  "wallet": "",
  "merkle_root": "",
  "status": "inactive",
  "system": "F.P.P. Proof Runner V1.0"
}`,

  // 6. ROOT PACKAGE.JSON
  'package.json': `{
  "name": "founding-patrons-protocol",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "npm -w packages/indexer run build",
    "test": "npm -w packages/indexer run test",
    "sample": "npm -w packages/indexer run sample",
    "snapshot": "npm -w packages/indexer run snapshot",
    "proof": "npm -w packages/indexer run proof",
    "verify": "npm -w packages/indexer run verify"
  }
}`,
  
  // (DİĞER INDEXER KODLARI AYNEN DEVAM EDİYOR - KISALTILMADI)
  'packages/indexer/package.json': `{
  "name": "@ilhan-art/fpp-indexer",
  "version": "0.1.0",
  "private": true,
  "main": "dist/cli.js",
  "bin": {
    "fp": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "sample": "ts-node src/cli.ts sample",
    "snapshot": "ts-node src/cli.ts snapshot",
    "proof": "ts-node src/cli.ts proof",
    "verify": "ts-node src/cli.ts verify"
  },
  "dependencies": {
    "@solana/web3.js": "^1.95.0",
    "@solana/spl-token": "^0.4.8",
    "better-sqlite3": "^11.0.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5",
    "vitest": "^2.0.5"
  }
}`,

  'packages/indexer/tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src", "test"]
}`,

  'packages/indexer/vitest.config.ts': `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"]
  }
});`,

  'packages/indexer/src/types.ts': `export type Wallet = string;

export type SampleRow = {
  mint: string;
  wallet: Wallet;
  ts: number;
  balance: string;
};

export type SnapshotEntry = {
  wallet: Wallet;
  twab: string;
  points: number;
  token_score: string;
  multiplier: string;
  final_score: string;
  rank: number;
  leaf_hash: string;
};

export type SnapshotFile = {
  snapshot_id: string;
  mint: string;
  snapshot_ts: number;
  window_days: number;
  base: number;
  merkle_root: string;
  leaves_sorted_by_wallet: boolean;
  pair_hash_sorted: boolean;
  entries: SnapshotEntry[];
};

export type ProofFile = {
  snapshot_id: string;
  mint: string;
  wallet: Wallet;
  leaf_hash: string;
  merkle_root: string;
  proof: string[];
};`,

  'packages/indexer/src/utils.ts': `import crypto from "crypto";

export function sha256(buf: Buffer): Buffer {
  return crypto.createHash("sha256").update(buf).digest();
}

export function hex(buf: Buffer): string {
  return buf.toString("hex");
}

export function bytesFromHex(h: string): Buffer {
  return Buffer.from(h, "hex");
}

export function assertNonEmpty(value: string | undefined, name: string): string {
  if (!value || !value.trim()) throw new Error(\`Missing required value: \${name}\`);
  return value.trim();
}

export function roundToFixed(value: number, decimals: number): string {
  const m = Math.pow(10, decimals);
  const rounded = Math.round(value * m) / m;
  return rounded.toFixed(decimals);
}

export function clampToNumber(bi: bigint): number {
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (bi > max) return Number.MAX_SAFE_INTEGER;
  return Number(bi);
}`,

  'packages/indexer/src/config.ts': `export const DEFAULT_WINDOW_DAYS = 30;
export const DEFAULT_BASE = 1000;
export const SCORE_DECIMALS = 12;`,

  'packages/indexer/src/db.ts': `import Database from "better-sqlite3";

export type Db = Database.Database;

export function openDb(path: string): Db {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

function initSchema(db: Db): void {
  db.exec(\`
    CREATE TABLE IF NOT EXISTS samples (
      mint TEXT NOT NULL,
      wallet TEXT NOT NULL,
      ts INTEGER NOT NULL,
      balance TEXT NOT NULL,
      PRIMARY KEY (mint, wallet, ts)
    );

    CREATE INDEX IF NOT EXISTS idx_samples_mint_ts ON samples(mint, ts);
    CREATE INDEX IF NOT EXISTS idx_samples_mint_wallet_ts ON samples(mint, wallet, ts);
  \`);
}

export function upsertSamples(
  db: Db,
  mint: string,
  ts: number,
  balancesByWallet: Map<string, bigint>
): number {
  const stmt = db.prepare(
    \`INSERT OR REPLACE INTO samples (mint, wallet, ts, balance) VALUES (?, ?, ?, ?)\`
  );
  const tx = db.transaction(() => {
    let count = 0;
    for (const [wallet, bal] of balancesByWallet.entries()) {
      stmt.run(mint, wallet, ts, bal.toString());
      count++;
    }
    return count;
  });
  return tx();
}

export function listWallets(db: Db, mint: string, snapshotTs: number): string[] {
  const rows = db
    .prepare(\`SELECT DISTINCT wallet FROM samples WHERE mint = ? AND ts <= ?\`)
    .all(mint, snapshotTs) as { wallet: string }[];
  return rows.map(r => r.wallet).sort((a, b) => a.localeCompare(b));
}

export function getLastSampleBefore(
  db: Db,
  mint: string,
  wallet: string,
  beforeTs: number
): { ts: number; balance: bigint } | null {
  const row = db
    .prepare(
      \`SELECT ts, balance FROM samples
       WHERE mint = ? AND wallet = ? AND ts < ?
       ORDER BY ts DESC LIMIT 1\`
    )
    .get(mint, wallet, beforeTs) as { ts: number; balance: string } | undefined;

  if (!row) return null;
  return { ts: row.ts, balance: BigInt(row.balance) };
}

export function getSamplesInRange(
  db: Db,
  mint: string,
  wallet: string,
  fromTs: number,
  toTs: number
): { ts: number; balance: bigint }[] {
  const rows = db
    .prepare(
      \`SELECT ts, balance FROM samples
       WHERE mint = ? AND wallet = ? AND ts >= ? AND ts <= ?
       ORDER BY ts ASC\`
    )
    .all(mint, wallet, fromTs, toTs) as { ts: number; balance: string }[];

  return rows.map(r => ({ ts: r.ts, balance: BigInt(r.balance) }));
}`,

  'packages/indexer/src/solana.ts': `import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function fetchHolderBalancesByOwner(
  rpcUrl: string,
  mintBase58: string
): Promise<Map<string, bigint>> {
  const conn = new Connection(rpcUrl, "confirmed");
  const mint = new PublicKey(mintBase58);

  const accounts = await conn.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mint.toBase58() } }
    ]
  });

  const totals = new Map<string, bigint>();

  for (const acc of accounts) {
    const data = acc.account.data;
    if (data.length < 72) continue;

    const owner = new PublicKey(data.subarray(32, 64)).toBase58();
    const amount = data.readBigUInt64LE(64);

    if (amount === 0n) continue;

    const prev = totals.get(owner) ?? 0n;
    totals.set(owner, prev + amount);
  }

  return totals;
}`,

  'packages/indexer/src/twab.ts': `export function computeTwabFloor(
  windowStartTs: number,
  snapshotTs: number,
  lastBeforeWindow: { ts: number; balance: bigint } | null,
  samplesInWindow: { ts: number; balance: bigint }[]
): bigint {
  if (snapshotTs <= windowStartTs) return 0n;

  const start = BigInt(windowStartTs);
  const end = BigInt(snapshotTs);
  const duration = end - start;

  let prevTs = start;
  let prevBal = lastBeforeWindow ? lastBeforeWindow.balance : 0n;

  let area = 0n;

  for (const s of samplesInWindow) {
    const ts = BigInt(s.ts);
    if (ts < start) continue;
    if (ts > end) break;

    const dt = ts - prevTs;
    if (dt > 0n) area += prevBal * dt;

    prevTs = ts;
    prevBal = s.balance;
  }

  const tail = end - prevTs;
  if (tail > 0n) area += prevBal * tail;

  return area / duration;
}`,

  'packages/indexer/src/scoring.ts': `import { clampToNumber, roundToFixed } from "./utils";
import { SCORE_DECIMALS } from "./config";

export function computeScores(params: {
  twab: bigint;
  points: number;
  base: number;
}): {
  tokenScore: string;
  multiplier: string;
  finalScore: string;
} {
  const twabNum = clampToNumber(params.twab);

  const tokenScoreNum = Math.log10(1 + twabNum);
  const multiplierNum = 1 + params.points / params.base;
  const finalScoreNum = tokenScoreNum * multiplierNum;

  return {
    tokenScore: roundToFixed(tokenScoreNum, SCORE_DECIMALS),
    multiplier: roundToFixed(multiplierNum, SCORE_DECIMALS),
    finalScore: roundToFixed(finalScoreNum, SCORE_DECIMALS)
  };
}`,

  'packages/indexer/src/contributions.ts': `import fs from "fs";

export function loadContributions(path?: string): Map<string, number> {
  if (!path) return new Map();

  const raw = fs.readFileSync(path, "utf8");
  const obj = JSON.parse(raw) as Record<string, number>;

  const map = new Map<string, number>();
  for (const [wallet, points] of Object.entries(obj)) {
    if (typeof points !== "number" || !Number.isFinite(points) || points < 0) continue;
    map.set(wallet, Math.floor(points));
  }
  return map;
}`,

  'packages/indexer/src/merkle.ts': `import { bytesFromHex, hex, sha256 } from "./utils";

export type MerkleBuildResult = {
  root: Buffer;
  leafHashes: Buffer[];
};

function sortPair(a: Buffer, b: Buffer): [Buffer, Buffer] {
  return Buffer.compare(a, b) <= 0 ? [a, b] : [b, a];
}

export function buildMerkle(leafHashes: Buffer[]): MerkleBuildResult {
  if (leafHashes.length === 0) {
    return { root: sha256(Buffer.from("EMPTY")), leafHashes };
  }

  let level = leafHashes.slice();

  while (level.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? level[i];
      const [a, b] = sortPair(left, right);
      next.push(sha256(Buffer.concat([a, b])));
    }
    level = next;
  }

  return { root: level[0], leafHashes };
}

export function leafHashFrom(wallet: string, finalScoreFixed: string): Buffer {
  const payload = Buffer.from(\`\${wallet}|\${finalScoreFixed}\`, "utf8");
  return sha256(payload);
}

export function merkleProof(leafHashes: Buffer[], index: number): Buffer[] {
  if (index < 0 || index >= leafHashes.length) throw new Error("Invalid leaf index");

  let idx = index;
  let level = leafHashes.slice();
  const proof: Buffer[] = [];

  while (level.length > 1) {
    const isRight = idx % 2 === 1;
    const pairIndex = isRight ? idx - 1 : idx + 1;
    const sibling = level[pairIndex] ?? level[idx];
    proof.push(sibling);

    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? level[i];
      const [a, b] = Buffer.compare(left, right) <= 0 ? [left, right] : [right, left];
      next.push(sha256(Buffer.concat([a, b])));
    }

    level = next;
    idx = Math.floor(idx / 2);
  }

  return proof;
}

export function verifyProof(params: {
  wallet: string;
  finalScoreFixed: string;
  proof: string[];
  rootHex: string;
}): boolean {
  let h = leafHashFrom(params.wallet, params.finalScoreFixed);

  for (const sibHex of params.proof) {
    const sib = bytesFromHex(sibHex);
    const [a, b] = Buffer.compare(h, sib) <= 0 ? [h, sib] : [sib, h];
    h = sha256(Buffer.concat([a, b]));
  }

  return hex(h) === params.rootHex.toLowerCase();
}`,

  'packages/indexer/src/snapshot.ts': `import fs from "fs";
import { Db, getLastSampleBefore, getSamplesInRange, listWallets } from "./db";
import { computeTwabFloor } from "./twab";
import { computeScores } from "./scoring";
import { DEFAULT_BASE, DEFAULT_WINDOW_DAYS, SCORE_DECIMALS } from "./config";
import { buildMerkle, leafHashFrom } from "./merkle";
import { hex } from "./utils";
import { SnapshotFile, SnapshotEntry } from "./types";

export function generateSnapshot(params: {
  db: Db;
  mint: string;
  snapshotId: string;
  snapshotTs: number;
  windowDays?: number;
  base?: number;
  contributions?: Map<string, number>;
}): SnapshotFile {
  const windowDays = params.windowDays ?? DEFAULT_WINDOW_DAYS;
  const base = params.base ?? DEFAULT_BASE;

  const windowStart = params.snapshotTs - windowDays * 86400;
  const wallets = listWallets(params.db, params.mint, params.snapshotTs);

  const contrib = params.contributions ?? new Map<string, number>();

  const rawEntries: Omit<SnapshotEntry, "rank">[] = [];

  for (const wallet of wallets) {
    const lastBefore = getLastSampleBefore(params.db, params.mint, wallet, windowStart);
    const samples = getSamplesInRange(params.db, params.mint, wallet, windowStart, params.snapshotTs);

    const twab = computeTwabFloor(windowStart, params.snapshotTs, lastBefore, samples);
    const points = contrib.get(wallet) ?? 0;

    const { tokenScore, multiplier, finalScore } = computeScores({ twab, points, base });

    const leaf = leafHashFrom(wallet, finalScore);
    rawEntries.push({
      wallet,
      twab: twab.toString(),
      points,
      token_score: tokenScore,
      multiplier,
      final_score: finalScore,
      leaf_hash: hex(leaf)
    });
  }

  const byRank = rawEntries.slice().sort((a, b) => {
    const sa = Number(a.final_score);
    const sb = Number(b.final_score);
    if (sb !== sa) return sb - sa;
    return a.wallet.localeCompare(b.wallet);
  });

  const ranked: SnapshotEntry[] = byRank.map((e, i) => ({ ...e, rank: i + 1 }));

  const leavesSorted = ranked
    .slice()
    .sort((a, b) => a.wallet.localeCompare(b.wallet))
    .map(e => Buffer.from(e.leaf_hash, "hex"));

  const merkle = buildMerkle(leavesSorted);

  return {
    snapshot_id: params.snapshotId,
    mint: params.mint,
    snapshot_ts: params.snapshotTs,
    window_days: windowDays,
    base,
    merkle_root: hex(merkle.root),
    leaves_sorted_by_wallet: true,
    pair_hash_sorted: true,
    entries: ranked
  };
}

export function writeSnapshot(path: string, snapshot: SnapshotFile): void {
  const pretty = JSON.stringify(snapshot, null, 2);
  fs.writeFileSync(path, pretty, "utf8");
}`,

  'packages/indexer/src/proofs.ts': `import fs from "fs";
import { SnapshotFile, ProofFile } from "./types";
import { buildMerkle, merkleProof, verifyProof } from "./merkle";
import { bytesFromHex, hex } from "./utils";

export function loadSnapshot(path: string): SnapshotFile {
  return JSON.parse(fs.readFileSync(path, "utf8")) as SnapshotFile;
}

export function produceProof(params: {
  snapshotPath: string;
  wallet: string;
  outPath: string;
}): ProofFile {
  const snap = loadSnapshot(params.snapshotPath);

  const entriesByWallet = snap.entries.slice().sort((a, b) => a.wallet.localeCompare(b.wallet));
  const idx = entriesByWallet.findIndex(e => e.wallet === params.wallet);
  if (idx === -1) throw new Error("Wallet not found in snapshot");

  const leafHashes = entriesByWallet.map(e => bytesFromHex(e.leaf_hash));
  const merkle = buildMerkle(leafHashes);
  const proofBuf = merkleProof(leafHashes, idx);

  const entry = entriesByWallet[idx];

  const proofFile: ProofFile = {
    snapshot_id: snap.snapshot_id,
    mint: snap.mint,
    wallet: params.wallet,
    leaf_hash: entry.leaf_hash,
    merkle_root: hex(merkle.root),
    proof: proofBuf.map(b => hex(b))
  };

  fs.writeFileSync(params.outPath, JSON.stringify(proofFile, null, 2), "utf8");
  return proofFile;
}

export function verifyProofFile(path: string): boolean {
  const p = JSON.parse(fs.readFileSync(path, "utf8")) as ProofFile;

  const leafParts = p.leaf_hash; 
  if (!leafParts) throw new Error("Invalid proof file");

  const ok = verifyProof({
    wallet: p.wallet,
    finalScoreFixed: "0.000000000000",
    proof: p.proof,
    rootHex: p.merkle_root
  });

  return ok;
}`,

  'packages/indexer/src/cli.ts': `#!/usr/bin/env node
import { Command } from "commander";
import { assertNonEmpty } from "./utils";
import { openDb, upsertSamples } from "./db";
import { fetchHolderBalancesByOwner } from "./solana";
import { DEFAULT_BASE, DEFAULT_WINDOW_DAYS } from "./config";
import { generateSnapshot, writeSnapshot } from "./snapshot";
import { loadContributions } from "./contributions";
import { produceProof, verifyProofFile } from "./proofs";

const program = new Command();

program
  .name("fp")
  .description("Founding Patrons Protocol — Reference Indexer CLI")
  .version("0.1.0");

program
  .command("sample")
  .description("Sample on-chain SPL holder balances into SQLite")
  .requiredOption("--rpc <url>", "Solana RPC URL")
  .requiredOption("--mint <address>", "SPL mint address (base58)")
  .requiredOption("--db <path>", "SQLite database path")
  .option("--ts <unix>", "Explicit unix timestamp (UTC seconds)")
  .action(async (opts) => {
    const rpc = assertNonEmpty(opts.rpc, "rpc");
    const mint = assertNonEmpty(opts.mint, "mint");
    const dbPath = assertNonEmpty(opts.db, "db");

    const ts = opts.ts ? Number(opts.ts) : Math.floor(Date.now() / 1000);
    if (!Number.isFinite(ts) || ts <= 0) throw new Error("Invalid --ts");

    const balances = await fetchHolderBalancesByOwner(rpc, mint);

    const db = openDb(dbPath);
    const count = upsertSamples(db, mint, ts, balances);
    db.close();

    console.log(\`OK: sampled \${count} wallets at ts=\${ts}\`);
  });

program
  .command("snapshot")
  .description("Generate deterministic snapshot artifact (JSON)")
  .requiredOption("--db <path>", "SQLite database path")
  .requiredOption("--out <path>", "Output JSON path")
  .requiredOption("--snapshot-id <id>", "Snapshot id string")
  .requiredOption("--mint <address>", "SPL mint address (base58)")
  .option("--snapshot-ts <unix>", "Snapshot unix timestamp (UTC seconds)")
  .option("--window-days <n>", "Trailing window in days", \`\${DEFAULT_WINDOW_DAYS}\`)
  .option("--base <n>", "Contribution base", \`\${DEFAULT_BASE}\`)
  .option("--contrib <path>", "Contributions JSON path")
  .action((opts) => {
    const dbPath = assertNonEmpty(opts.db, "db");
    const outPath = assertNonEmpty(opts.out, "out");
    const snapshotId = assertNonEmpty(opts["snapshotId"] ?? opts["snapshot-id"], "snapshot-id");
    const mint = assertNonEmpty(opts.mint, "mint");

    const snapshotTs = opts.snapshotTs ? Number(opts.snapshotTs) : Math.floor(Date.now() / 1000);
    const windowDays = Number(opts.windowDays);
    const base = Number(opts.base);

    const db = openDb(dbPath);
    const contributions = loadContributions(opts.contrib);

    const snap = generateSnapshot({
      db,
      mint,
      snapshotId,
      snapshotTs,
      windowDays,
      base,
      contributions
    });

    db.close();
    writeSnapshot(outPath, snap);

    console.log(\`OK: snapshot written to \${outPath}\`);
    console.log(\`merkle_root=\${snap.merkle_root}\`);
  });

program
  .command("proof")
  .description("Produce an inclusion proof for a wallet from a snapshot JSON")
  .requiredOption("--snapshot <path>", "Snapshot JSON path")
  .requiredOption("--wallet <address>", "Wallet base58")
  .requiredOption("--out <path>", "Output proof JSON path")
  .action((opts) => {
    produceProof({
      snapshotPath: opts.snapshot,
      wallet: opts.wallet,
      outPath: opts.out
    });
    console.log(\`OK: proof written to \${opts.out}\`);
  });

program
  .command("verify")
  .description("Verify a proof JSON file")
  .requiredOption("--proof <path>", "Proof JSON path")
  .action((opts) => {
    const ok = verifyProofFile(opts.proof);
    if (!ok) {
      console.error("FAIL: invalid proof");
      process.exit(1);
    }
    console.log("OK: proof valid");
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});`,

  'packages/indexer/test/scoring.test.ts': `import { describe, it, expect } from "vitest";
import { computeScores } from "../src/scoring";

describe("scoring", () => {
  it("computes tokenScore, multiplier, finalScore deterministically", () => {
    const r = computeScores({ twab: 999n, points: 1000, base: 1000 });
    expect(r.multiplier).toBe("2.000000000000");
    expect(typeof r.finalScore).toBe("string");
  });
});`,

  'packages/indexer/test/merkle.test.ts': `import { describe, it, expect } from "vitest";
import { buildMerkle, leafHashFrom, merkleProof, verifyProof } from "../src/merkle";
import { hex } from "../src/utils";

describe("merkle", () => {
  it("builds root and verifies proof", () => {
    const leaves = [
      leafHashFrom("A", "1.000000000000"),
      leafHashFrom("B", "2.000000000000"),
      leafHashFrom("C", "3.000000000000")
    ];
    const { root } = buildMerkle(leaves);
    const proof = merkleProof(leaves, 1).map(hex);

    const ok = verifyProof({
      wallet: "B",
      finalScoreFixed: "2.000000000000",
      proof,
      rootHex: hex(root)
    });

    expect(ok).toBe(true);
  });
});`,

  'packages/indexer/test/vectors.test.ts': `import { describe, it, expect } from "vitest";
import { computeTwabFloor } from "../src/twab";

describe("vectors", () => {
  it("computes TWAB floor with piecewise-constant integration", () => {
    const twab = computeTwabFloor(
      0,
      10,
      { ts: -1, balance: 100n },
      [{ ts: 5, balance: 0n }]
    );
    expect(twab).toBe(50n);
  });
});`,

  // ANCHOR PROGRAM (AYNEN KALIYOR)
  'programs/fp_registry/Anchor.toml': `[features]
seeds = false
skip-lint = false

[programs.localnet]
fp_registry = "Fg6PaFpoGXkYsidMpWxTWqkZcGm7b9rZ5kVYbqZzYb"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "anchor test"`,

  'programs/fp_registry/Cargo.toml': `[workspace]
members = [
  "programs/*"
]
resolver = "2"`,

  'programs/fp_registry/programs/fp_registry/Cargo.toml': `[package]
name = "fp_registry"
version = "0.1.0"
description = "FPP Registry program (snapshot commits)"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "fp_registry"

[dependencies]
anchor-lang = "0.30.1"`,

  'programs/fp_registry/programs/fp_registry/src/lib.rs': `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZcGm7b9rZ5kVYbqZzYb");

#[program]
pub mod fp_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let reg = &mut ctx.accounts.registry;
        reg.authority = authority;
        Ok(())
    }

    pub fn publish_snapshot(
        ctx: Context<PublishSnapshot>,
        mint: Pubkey,
        snapshot_ts: i64,
        merkle_root: [u8; 32],
        artifact_uri: String
    ) -> Result<()> {
        require!(artifact_uri.len() <= 200, RegistryError::UriTooLong);

        let reg = &ctx.accounts.registry;
        require_keys_eq!(reg.authority, ctx.accounts.authority.key(), RegistryError::Unauthorized);

        let snap = &mut ctx.accounts.snapshot;
        snap.mint = mint;
        snap.snapshot_ts = snapshot_ts;
        snap.merkle_root = merkle_root;
        snap.artifact_uri = artifact_uri;
        Ok(())
    }
}

#[account]
pub struct Registry {
    pub authority: Pubkey
}

#[account]
pub struct SnapshotCommit {
    pub mint: Pubkey,
    pub snapshot_ts: i64,
    pub merkle_root: [u8; 32],
    pub artifact_uri: String
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PublishSnapshot<'info> {
    pub registry: Account<'info, Registry>,
    #[account(init, payer = payer, space = 8 + 32 + 8 + 32 + 4 + 200)]
    pub snapshot: Account<'info, SnapshotCommit>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum RegistryError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("URI too long")]
    UriTooLong
}`
};

// --- DOSYALARI OLUŞTURMA FONKSİYONU ---
async function createFiles() {
  console.log('🚀 Founding Patrons Protocol (F.P.P.) V1.1 (Snapshot & Proof) Güncelleniyor...');
  
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Güncellendi: ${filePath}`);
  }

  console.log('\n🏁 Güncelleme Tamamlandı!');
}

createFiles();