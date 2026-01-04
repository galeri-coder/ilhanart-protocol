import fs from "fs";
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
}