import { clampToNumber, roundToFixed } from "./utils";
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
}