import fs from "fs";
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
}