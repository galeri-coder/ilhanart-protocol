use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZcGm7b9rZ5kVYbqZzYb");

#[program]
pub mod fp_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        let reg = &mut ctx.accounts.registry;
        reg.authority = authority;
        Ok(())
    }

    pub fn publish_snapshot(
        ctx: Context<PublishSnapshot>,
        mint: Pubkey,
        snapshot_ts: i64,
        merkle_root: [u8; 32],
        artifact_uri: String
    ) -> Result<()> {
        require!(artifact_uri.len() <= 200, RegistryError::UriTooLong);

        let reg = &ctx.accounts.registry;
        require_keys_eq!(reg.authority, ctx.accounts.authority.key(), RegistryError::Unauthorized);

        let snap = &mut ctx.accounts.snapshot;
        snap.mint = mint;
        snap.snapshot_ts = snapshot_ts;
        snap.merkle_root = merkle_root;
        snap.artifact_uri = artifact_uri;
        Ok(())
    }
}

#[account]
pub struct Registry {
    pub authority: Pubkey
}

#[account]
pub struct SnapshotCommit {
    pub mint: Pubkey,
    pub snapshot_ts: i64,
    pub merkle_root: [u8; 32],
    pub artifact_uri: String
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PublishSnapshot<'info> {
    pub registry: Account<'info, Registry>,
    #[account(init, payer = payer, space = 8 + 32 + 8 + 32 + 4 + 200)]
    pub snapshot: Account<'info, SnapshotCommit>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum RegistryError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("URI too long")]
    UriTooLong
}