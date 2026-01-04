export function computeTwabFloor(
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
}