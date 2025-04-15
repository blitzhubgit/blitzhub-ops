# Smart Contracts Description

## Description
Details of Rust/Anchor smart contracts (e.g., `create_token`, `buy_token`), including functions, parameters, usage examples, tests, and deployment instructions.

## How to Develop
- **Audience**: Blockchain developers.
- **Tone**: Technical, with practical examples.
- **Format**: Markdown with Rust code snippets and commands.

## Steps to Build
- Introduce contracts: "BlitzHub smart contracts are written in Rust with Anchor."
- List functions: `create_token`, `buy_token`, `graduate_token`, with parameters and outputs.
- Add examples: Code snippets (e.g., `create_token` with linear curve).
- Explain tests: Commands like `anchor test --provider.cluster devnet`.
- Detail deployment: E.g., `anchor deploy --provider.cluster mainnet-beta`.
- Include monitoring: E.g., Prometheus `solana_contract_execution_total`.

# Smart Contracts for BlitzHub 🛠️

This document details the Rust/Anchor smart contracts for BlitzHub, including key functions and deployment steps.

## Overview
BlitzHub's smart contracts are written in Rust using the Anchor framework. They handle token creation, trading via a bonding curve, and graduation to Raydium. The contracts are deployed on the Solana blockchain.

## Key Functions

### `create_token`
- **Purpose**: Allows users to create a new token on BlitzHub.
- **Parameters**:
  - `name`: Token name (string).
  - `symbol`: Token symbol (string).
  - `uri`: Metadata URI for the token (string).
- **Logic**:
  - Total supply: 1B tokens.
  - Creation fee: 0.01 SOL (covers network fees + 105,000 tokens for the creator).
  - Retains 1% (10M tokens) for development.
  - Burns 30% (300M tokens) before graduation.
- **Network Fees**: 0.003 SOL ($0.45 @ $150/SOL).

### `trade_token`
- **Purpose**: Allows users to buy or sell tokens using a bonding curve.
- **Parameters**:
  - `amount`: Amount of SOL to buy/sell.
  - `buy`: Boolean (true for buy, false for sell).
- **Logic**:
  - Uses a bonding curve to determine token price.
  - Platform fees: 0%-0.5% (average 0.25%), refunded upon graduation.
- **Network Fees**: 0.0005 SOL ($0.075) per transaction.

## Graduation to Raydium
When a token reaches a market cap of $69,000, it automatically graduates to Raydium by creating a liquidity pool (LP) using the CP-Swap (Constant Product Market Maker) mechanism. This process is fully automated in the smart contract.

### Implementation Details
- **Monitoring Market Cap**:
  - The contract calculates the market cap dynamically: `market_cap = token_price * tokens_in_circulation`.
  - Tokens in circulation: 690M (1B - 10M development - 300M burned).
  - Target: $69,000.
- **Creating the Liquidity Pool**:
  - When the market cap reaches $69,000, the contract creates a pool on Raydium using the Raydium SDK.
  - LP: 614 SOL ($92,100) and 634.5M tokens.
  - Structure: 50/50 (SOL/Token) → 307 SOL ($46,050) and tokens worth $46,050.
  - Slippage: 10.8% for a $10,000 order.
- **Code Example**:
  ```rust
  pub fn graduate_to_raydium(ctx: Context<GraduateToken>) -> Result<()> {
      let market_cap_usd = calculate_market_cap();
      if market_cap_usd < 69_000_000_000 {
          return err!(ErrorCode::MarketCapNotReached);
      }
      let sol_amount: u64 = 307_000_000_000; // 307 SOL
      let token_amount: u64 = 634_500_000_000_000; // 634.5M tokens
      create_pool(
          &ctx.accounts.amm_program,
          &ctx.accounts.pool_account,
          &ctx.accounts.token_mint.key(),
          &ctx.accounts.sol_mint.key(),
          sol_amount,
          token_amount,
          initial_price,
          &ctx.accounts.vault,
          &ctx.accounts.authority,
          &ctx.accounts.token_program,
          &ctx.accounts.system_program,
          &ctx.accounts.rent,
      )?;
      emit!(GraduationEvent {
          token_mint: ctx.accounts.token_mint.key(),
          pool_address: ctx.accounts.pool_account.key(),
      });
      Ok(())
  }
  ```
- **Event Emission**:
  - The contract emits a `GraduationEvent` with the token mint and pool address, which the frontend (React) can listen to for notifications.
- **Network Fees**:
  - Creating the LP: 0.003 SOL ($0.45), paid by the platform (included in expenses).

## Deployment Steps
- **Step 1**: Install dependencies (Rust, Anchor, Solana CLI).
- **Step 2**: Build the contract: `anchor build`.
- **Step 3**: Deploy to Solana devnet: `anchor deploy --provider.cluster devnet`.
- **Step 4**: Test the deployment: `anchor test`.
