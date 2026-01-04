#!/usr/bin/env node
import { Command } from "commander";
import { assertNonEmpty } from "./utils";
import { openDb, upsertSamples } from "./db";
import { fetchHolderBalancesByOwner } from "./solana";
import { DEFAULT_BASE, DEFAULT_WINDOW_DAYS } from "./config";
import { generateSnapshot, writeSnapshot } from "./snapshot";
import { loadContributions } from "./contributions";
import { produceProof, verifyProofFile } from "./proofs";

const program = new Command();

program
  .name("fp")
  .description("Founding Patrons Protocol — Reference Indexer CLI")
  .version("0.1.0");

program
  .command("sample")
  .description("Sample on-chain SPL holder balances into SQLite")
  .requiredOption("--rpc <url>", "Solana RPC URL")
  .requiredOption("--mint <address>", "SPL mint address (base58)")
  .requiredOption("--db <path>", "SQLite database path")
  .option("--ts <unix>", "Explicit unix timestamp (UTC seconds)")
  .action(async (opts) => {
    const rpc = assertNonEmpty(opts.rpc, "rpc");
    const mint = assertNonEmpty(opts.mint, "mint");
    const dbPath = assertNonEmpty(opts.db, "db");

    const ts = opts.ts ? Number(opts.ts) : Math.floor(Date.now() / 1000);
    if (!Number.isFinite(ts) || ts <= 0) throw new Error("Invalid --ts");

    const balances = await fetchHolderBalancesByOwner(rpc, mint);

    const db = openDb(dbPath);
    const count = upsertSamples(db, mint, ts, balances);
    db.close();

    console.log(`OK: sampled ${count} wallets at ts=${ts}`);
  });

program
  .command("snapshot")
  .description("Generate deterministic snapshot artifact (JSON)")
  .requiredOption("--db <path>", "SQLite database path")
  .requiredOption("--out <path>", "Output JSON path")
  .requiredOption("--snapshot-id <id>", "Snapshot id string")
  .requiredOption("--mint <address>", "SPL mint address (base58)")
  .option("--snapshot-ts <unix>", "Snapshot unix timestamp (UTC seconds)")
  .option("--window-days <n>", "Trailing window in days", `${DEFAULT_WINDOW_DAYS}`)
  .option("--base <n>", "Contribution base", `${DEFAULT_BASE}`)
  .option("--contrib <path>", "Contributions JSON path")
  .action((opts) => {
    const dbPath = assertNonEmpty(opts.db, "db");
    const outPath = assertNonEmpty(opts.out, "out");
    const snapshotId = assertNonEmpty(opts["snapshotId"] ?? opts["snapshot-id"], "snapshot-id");
    const mint = assertNonEmpty(opts.mint, "mint");

    const snapshotTs = opts.snapshotTs ? Number(opts.snapshotTs) : Math.floor(Date.now() / 1000);
    const windowDays = Number(opts.windowDays);
    const base = Number(opts.base);

    const db = openDb(dbPath);
    const contributions = loadContributions(opts.contrib);

    const snap = generateSnapshot({
      db,
      mint,
      snapshotId,
      snapshotTs,
      windowDays,
      base,
      contributions
    });

    db.close();
    writeSnapshot(outPath, snap);

    console.log(`OK: snapshot written to ${outPath}`);
    console.log(`merkle_root=${snap.merkle_root}`);
  });

program
  .command("proof")
  .description("Produce an inclusion proof for a wallet from a snapshot JSON")
  .requiredOption("--snapshot <path>", "Snapshot JSON path")
  .requiredOption("--wallet <address>", "Wallet base58")
  .requiredOption("--out <path>", "Output proof JSON path")
  .action((opts) => {
    produceProof({
      snapshotPath: opts.snapshot,
      wallet: opts.wallet,
      outPath: opts.out
    });
    console.log(`OK: proof written to ${opts.out}`);
  });

program
  .command("verify")
  .description("Verify a proof JSON file")
  .requiredOption("--proof <path>", "Proof JSON path")
  .action((opts) => {
    const ok = verifyProofFile(opts.proof);
    if (!ok) {
      console.error("FAIL: invalid proof");
      process.exit(1);
    }
    console.log("OK: proof valid");
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});