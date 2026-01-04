import fs from "fs";

export function loadContributions(path?: string): Map<string, number> {
  if (!path) return new Map();

  const raw = fs.readFileSync(path, "utf8");
  const obj = JSON.parse(raw) as Record<string, number>;

  const map = new Map<string, number>();
  for (const [wallet, points] of Object.entries(obj)) {
    if (typeof points !== "number" || !Number.isFinite(points) || points < 0) continue;
    map.set(wallet, Math.floor(points));
  }
  return map;
}