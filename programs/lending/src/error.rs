use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Over borrowable amount")]
    OverBorrowableAmount,
    #[msg("Requested amount exceeds depostitable amount")]
    OverRepay,
    #[msg("User is not under collateralized, cannot liquidate")]
    NotUnderCollateralized,

}