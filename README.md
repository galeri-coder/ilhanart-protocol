# Founding Patrons Protocol — MVP (Work in Progress)

This repository provides an engineering-verifiable MVP for the Founding Patrons pipeline:
a deterministic process that samples on-chain SPL holder data into SQLite and produces auditable artifacts.

This repository is built for transparency and technical due diligence.
No financial return, yield, payout, or trading claims are made here.

## Production Operation

A GitHub Actions workflow runs every 6 hours:
- Runs the indexer CLI in sampling mode
- Writes the SQLite database to `data/fp.db`
- Uploads `data/fp.db` as a GitHub Actions Artifact
- Updates and commits `data/last_run.json` as a public heartbeat

### Why this design
- No repo bloat: the database is not committed
- Public heartbeat: the repository shows continuous updates via `data/last_run.json`
- Downloadable evidence: each run archives `fp.db` as an Artifact

## Required Secrets

Repository Settings → Secrets and variables → Actions:
- `SOLANA_RPC_URL`
- `SPL_MINT_ADDRESS`

## How to Verify the System
1. Open the Actions tab
2. Open the latest run for “Ilhan Art - FPP Indexer (Production)”
3. Confirm Artifact `fpp-database-<run_id>` exists
4. Confirm `data/last_run.json` changed recently on the repo homepage

## Local Run (Developers)
```bash
cd packages/indexer
npm ci

RPC_URL="YOUR_RPC_URL"
MINT="YOUR_MINT_ADDRESS"
NOW_TS=$(date -u +%s)

npx ts-node src/cli.ts sample \
  --rpc "$RPC_URL" \
  --mint "$MINT" \
  --db "../../data/fp.db" \
  --ts "$NOW_TS"
```

## Roadmap
Sampling is the production milestone.
Snapshot generation, Merkle commitments, and wallet inclusion proofs are included as code modules and CLI commands, and can be activated in CI after production sampling is stable.