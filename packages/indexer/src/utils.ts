import crypto from "crypto";

export function sha256(buf: Buffer): Buffer {
  return crypto.createHash("sha256").update(buf).digest();
}

export function hex(buf: Buffer): string {
  return buf.toString("hex");
}

export function bytesFromHex(h: string): Buffer {
  return Buffer.from(h, "hex");
}

export function assertNonEmpty(value: string | undefined, name: string): string {
  if (!value || !value.trim()) throw new Error(`Missing required value: ${name}`);
  return value.trim();
}

export function roundToFixed(value: number, decimals: number): string {
  const m = Math.pow(10, decimals);
  const rounded = Math.round(value * m) / m;
  return rounded.toFixed(decimals);
}

export function clampToNumber(bi: bigint): number {
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (bi > max) return Number.MAX_SAFE_INTEGER;
  return Number(bi);
}