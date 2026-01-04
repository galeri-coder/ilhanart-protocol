import { describe, it, expect } from "vitest";
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
});