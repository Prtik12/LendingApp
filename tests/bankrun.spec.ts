import { describe } from 'node:test';
import IDL from '../target/idl/lending.json';
import { Lending } from '../target/types/lending_protocol';
import { BanksClient, ProgramTestContext, startAnchor } from 'solana-bankrun';
import { Connection, PublicKey } from '@solana/web3.js';
import { BankrunProvider } from 'anchor-bankrun';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { BankrunContextWrapper } from '../bankrun-utils/bankrunConnection';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { createMint } from 'spl-token-bankrun';

describe('Lending Smart Contract Test', async () => {
    let context: ProgramTestContext;
    let provider: BankrunProvider;
    let bankrunContextWrapper: BankrunContextWrapper;
    let program: Program<Lending>;
    let banksClient: BanksClient;
    let signer: Keypair;
    let usdcBankAccount: PublicKey;
    let solBankAccount: PublicKey;

    const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");

    const devnetConnection = new Connection("https://api.devnet.solana.com");
    const accountInfo = await devnetConnection.getAccountInfo(pyth);

    context = await startAnchor(
        "",
        [{ name: 'lending', programId: new PublicKey(IDL.address) }],
        [{ address: pyth, info: accountInfo }],
    );
    
    provider = new BankrunProvider(context);


    const SOL_PRICE_FEED_ID = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

    bankrunContextWrapper = new BankrunContextWrapper(context);

    const connection = BankrunContextWrapper.connection.toConnection();
 
    const pythSolanaReceiver = new PythSolanaReceiver({
        connection,
        wallet: provider.wallet,
    });

    const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID);

    const feedAccountInfo = await devnetConnection.getAccountInfo(solUsdPriceFeedAccount);

    context.setAccount(solUsdPriceFeedAccount, feedAccountInfo);

    program = new Program<Lending>(IDL as Lending, provider);

    banksClient = context.banksClient;

    signer = provider.wallet.payer;

    const mintUSDC = await createMint(
        banksClient,
        signer,
        signer.publicKey,
        null,
        2
    );

    const mintSol = await createMint(
        banksClient,
        signer,
        signer.publicKey,
        null,
        2
    );

[usdcBankAccount] = PublicKey.findProgramAddressSync(
   [Buffer.from("treasury", mintUSDC.toBuffer())],
    program.programId
);

[solBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury", mintSol.toBuffer())],
     program.programId
 );
});