import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function fetchHolderBalancesByOwner(
  rpcUrl: string,
  mintBase58: string
): Promise<Map<string, bigint>> {
  const conn = new Connection(rpcUrl, "confirmed");
  const mint = new PublicKey(mintBase58);

  const accounts = await conn.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mint.toBase58() } }
    ]
  });

  const totals = new Map<string, bigint>();

  for (const acc of accounts) {
    const data = acc.account.data;
    if (data.length < 72) continue;

    const owner = new PublicKey(data.subarray(32, 64)).toBase58();
    const amount = data.readBigUInt64LE(64);

    if (amount === 0n) continue;

    const prev = totals.get(owner) ?? 0n;
    totals.set(owner, prev + amount);
  }

  return totals;
}