export type Wallet = string;

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
};