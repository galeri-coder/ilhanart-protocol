import Database from "better-sqlite3";

export type Db = Database.Database;

export function openDb(path: string): Db {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

function initSchema(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS samples (
      mint TEXT NOT NULL,
      wallet TEXT NOT NULL,
      ts INTEGER NOT NULL,
      balance TEXT NOT NULL,
      PRIMARY KEY (mint, wallet, ts)
    );

    CREATE INDEX IF NOT EXISTS idx_samples_mint_ts ON samples(mint, ts);
    CREATE INDEX IF NOT EXISTS idx_samples_mint_wallet_ts ON samples(mint, wallet, ts);
  `);
}

export function upsertSamples(
  db: Db,
  mint: string,
  ts: number,
  balancesByWallet: Map<string, bigint>
): number {
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO samples (mint, wallet, ts, balance) VALUES (?, ?, ?, ?)`
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
    .prepare(`SELECT DISTINCT wallet FROM samples WHERE mint = ? AND ts <= ?`)
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
      `SELECT ts, balance FROM samples
       WHERE mint = ? AND wallet = ? AND ts < ?
       ORDER BY ts DESC LIMIT 1`
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
      `SELECT ts, balance FROM samples
       WHERE mint = ? AND wallet = ? AND ts >= ? AND ts <= ?
       ORDER BY ts ASC`
    )
    .all(mint, wallet, fromTs, toTs) as { ts: number; balance: string }[];

  return rows.map(r => ({ ts: r.ts, balance: BigInt(r.balance) }));
}