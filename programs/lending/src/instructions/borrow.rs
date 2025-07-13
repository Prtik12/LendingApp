use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;


#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint: Interface<'info, Mint>,
}