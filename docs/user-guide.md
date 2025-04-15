
# User Guide Description

## Description
A guide for end-users, explaining how to create tokens, buy tokens, view token details (e.g., MoonCoin’s page), understand fees and priorities, and access support (Telegram, Discord).

## How to Develop
- **Audience**: Token creators and traders, including beginners.
- **Tone**: Simple and direct, with practical examples.
- **Format**: Markdown with numbered steps, screenshots (if possible), and support links.

## Steps to Build
- Introduce the guide: "Welcome to BlitzHub! Learn to create and trade tokens."
- Describe token creation: Steps (form, validation, confirmation), with examples (e.g., name "MoonCoin", linear curve).
- Explain buying: 2 clicks (select 0.1 SOL, click "Buy"), with fee details (e.g., "Platform: 0.025 SOL").
- Detail token viewing: Access `/token/{mint}`, view market cap, volume, chart (TradingView), and chat.
- Explain fees and priorities: Table with examples (e.g., Standard 0.25%, low ~0.0001 SOL).
- Add support: Links to Telegram, Discord, and email (`contact@klytic.com`).



# User Guide for BlitzHub 📖

This guide walks you through using BlitzHub, a decentralized platform on Solana for creating, trading, and graduating tokens to DEXs like Raydium.

## Creating a Token 🛠️

- **Step 1**: Connect your Solana wallet (e.g., Phantom).
- **Step 2**: Click "Create Token" and fill in the details (name, symbol, description, image).
- **Step 3**: Pay the creation fee (0.01 SOL, $1.50 @ $150/SOL).
  - Covers network fees (0.003 SOL) and provides 105,000 tokens at the initial price ($0.00001/token).
- **Step 4**: Optionally buy up to 0.333 SOL ($50) worth of tokens with 0% platform fees (one-time).

## Buying and Trading Tokens 💸

- **Step 1**: Browse tokens on the platform or search by mint address.
- **Step 2**: Select a token to view details (charts, chat, etc.).
- **Step 3**: Enter the amount of SOL to buy or sell.
- **Platform Fees**: 0%-0.5% (average 0.25%), fully refunded upon graduation.
- **Network Fees**: 0.0005 SOL ($0.075) per transaction.

## Viewing Token Details 📊

- **Charts**: Price history and trading volume.
- **Chat**: Interact with the community (follow community guidelines in `community-guidelines.md`).
- **Token Info**: Market cap, total supply, and creator details.

## Understanding Fees 💡

- **Creation Fee**: 0.01 SOL (covers network fees + initial tokens).
- **Platform Fees**: 0%-0.5% (average 0.25%), refunded upon graduation.
- **Network Fees**: Paid per transaction (0.0005 SOL for trades, 0.003 SOL for token creation).

## Graduation to Raydium 🌟

Once a token reaches a market cap of $69,000, it automatically graduates to Raydium, a decentralized exchange (DEX) on Solana. Here's what happens:

- **Automatic Process**:
  - The BlitzHub smart contract monitors the token's market cap.
  - Upon reaching $69,000, a liquidity pool (LP) is created on Raydium with 614 SOL ($92,100) and 634.5M tokens.
  - The LP is structured as 50/50 (SOL/Token): 307 SOL ($46,050) and tokens worth $46,050.
  - Slippage for a $10,000 order is approximately 10.8%, ensuring decent liquidity for trading.
- **Notification**:
  - You will receive a notification in the BlitzHub interface with a link to the Raydium pool (e.g., `https://raydium.io/liquidity/?pool=<pool_address>`).
  - You can start trading your token on Raydium immediately.
- **Platform Fees Refund**:
  - All platform fees (0%-0.5%) paid during trading are refunded proportionally to traders upon graduation.

## Post-Graduation Visibility 📈

After graduating to Raydium, your token will be automatically listed on some platforms, while others require manual action to increase visibility. Follow these steps to maximize exposure:

- **Automatic Listings**:
  - **Jupiter**: Your token will be detected by Jupiter (a Solana aggregator) within hours of the Raydium listing, as the liquidity pool meets Jupiter's criteria (price impact &lt; 30% for a $500 swap). You will be notified when the token is available on `jup.ag`.
  - **DexScreener**: DexScreener will automatically detect your token and display its charts and data within a few hours. You will be notified when the token is available on `dexscreener.com/solana/<token_mint>`.
- **Manual Actions (Recommended)**:
  - **Verify on Jupiter**:
    - To remove the warning label ("⚠️") and increase trust, submit your token for verification at catdetlist.jup.ag.
    - Provide details like the token mint address, project website, and social links.
  - **Submit to CoinGecko**:
    - To list your token on CoinGecko (a major crypto tracking platform), submit a request at coingecko.com/en/coins/new.
    - Provide the token mint address, proof of liquidity (Raydium pool link), and project details (website, socials).
    - Once approved, you will be notified, and your token will be available on `coingecko.com`.
- **Why It Matters**:
  - Listing on Jupiter, DexScreener, and CoinGecko increases your token's visibility, attracting more traders and investors.
  - Verified listings on Jupiter and CoinGecko enhance trust and credibility.
