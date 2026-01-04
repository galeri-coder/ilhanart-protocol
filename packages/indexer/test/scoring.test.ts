import { describe, it, expect } from "vitest";
import { computeScores } from "../src/scoring";

describe("scoring", () => {
  it("computes tokenScore, multiplier, finalScore deterministically", () => {
    const r = computeScores({ twab: 999n, points: 1000, base: 1000 });
    expect(r.multiplier).toBe("2.000000000000");
    expect(typeof r.finalScore).toBe("string");
  });
});