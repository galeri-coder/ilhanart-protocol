import { describe, it, expect } from "vitest";
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
});