import { bytesFromHex, hex, sha256 } from "./utils";

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
  const payload = Buffer.from(`${wallet}|${finalScoreFixed}`, "utf8");
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
}