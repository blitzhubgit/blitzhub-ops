# Business Model for BlitzHub 🚀

## Overview 📜
BlitzHub is a platform on the Solana blockchain that enables creators to launch and trade tokens, primarily meme coins, with the goal of graduating them to Raydium once they reach a market cap of $69,000. The platform uses a bonding curve to determine token prices during trading, accumulates value in a vault, and creates a liquidity pool (LP) on Raydium upon graduation. The model includes token retention, burning, proportional fee refunds, and aggressive creator incentives to drive participation. The graduation target of $69,000 was chosen for its symbolic significance in the crypto and meme coin community, where the number 69 is a well-known internet meme often associated with humor and virality—values that resonate with the meme coin culture. This number also aligns BlitzHub competitively with platforms like Pump.fun (which uses a 69,000 RAY target, approximately $138,000), while keeping the goal more accessible to creators, fostering more frequent graduations and enhancing the platform's appeal.

## Key Mechanics ⚙️

### Token Creation 🛠️
- **Total Supply**: 1 billion (1B) tokens per project.
- **Creation Fee**: 0.01 SOL ($1.50 @ $150/SOL) 💸
  - Covers network fees: 0.003 SOL ($0.45).
  - Remaining 0.007 SOL ($1.05) converted into tokens for the creator at the initial price ($0.00001/token).
  - 0.007 SOL ($1.05) → 105,000 tokens.
- **Network Fees (Solana)**:
  - Paid by the creator as part of the 0.01 SOL fee.
- **Retention**:
  - 1% (10M tokens) retained by the platform for development purposes (no financial interest, not sold).
- **Burning**:
  - 30% (300M tokens) burned before graduation to reduce supply and increase token value 🔥.
- **Tokens for LP**:
  - Adjusted based on the price at graduation (see calculations below).
- **Tokens in Circulation**:
  - After retention and burning: 1B - 10M (development) - 300M (burned) = 690M tokens initially, adjusted for LP.

### Trading and Bonding Curve 📈
- **Initial Purchase (Creator Only)**:
  - Creator can buy up to 0.333 SOL ($50) worth of tokens (5M tokens at $0.00001/token) with 0% platform fees, one-time per token creation.
  - Network fees: 0.0005 SOL ($0.075) per transaction (paid by creator).
- **Subsequent Trading**:
  - Tokens are traded using a bonding curve (linear or exponential, not specified).
  - Platform fees: 0%-0.5% (average 0.25%), fully refunded to traders upon graduation.
- **Market Cap Target for Graduation**: $69,000 🎯.
- **Volume Accumulated in Vault**:
  - Estimated based on a bonding curve ratio (volume:market cap).
  - Base scenario: 3:1 ratio → 1,380 SOL ($207,000).

### Graduation to Raydium 🌟
- **Liquidity Pool (LP)**:
  - 614 SOL ($92,100) to create the LP on Raydium.
  - LP Structure (50/50 SOL/Token):
    - 307 SOL ($46,050).
    - 634.5M tokens (adjusted based on token price, see below).
- **Slippage**:
  - Order of 66.67 SOL ($10,000): Slippage = (66.67 ÷ 614) × 100% = 10.8% 📉.

### Fee Structure 💰
- **Platform Fees**:
  - Creation and creator's initial purchase (up to 0.333 SOL): 0%.
  - Subsequent trades: 0%-0.5% (average 0.25%).
  - Fully refunded to traders proportionally (each trader receives exactly what they paid).
- **No Graduation Fees**: Explicitly excluded.

### Expenses 🧾
- **Platform Fee Refunds**:
  - Calculated based on volume accumulated after the creator's initial purchase.
- **Creator Rewards**:
  - Standard: 10 SOL ($1,500).
  - Promotions: 15 SOL ($2,250).
  - Influencers/Teams/Discord Channels: 20 SOL ($3,000).
- **Milestone Reward**:
  - Tokens reaching $100,000 market cap in 24 hours: +2 SOL ($300) 🏆.
- **Network Fees (Solana)**:
  - **Creation**: 0.003 SOL ($0.45) (paid by creator via 0.01 SOL fee).
  - **Initial Purchase (Creator)**: 0.0005 SOL ($0.075) per transaction (paid by creator).
  - **Creating LP**: 3 transactions × 0.001 SOL = 0.003 SOL ($0.45).
  - **Refunding platform fees**: Estimated 100 traders, 1 transaction per trader × 0.0005 SOL = 0.05 SOL ($7.50).
  - Total (platform-paid): 0.003 + 0.05 = 0.053 SOL ($7.95).
- **Referral Bonus**:
  - 1 SOL ($150) per referred user, 50% chance → 0.5 SOL ($75) per token graduated.

## Financial Calculations (Base Scenario: 3:1 Ratio) 💹

### Base Assumptions
- **SOL Price**: $150/SOL.
- **Volume Accumulated (Vault)**: 1,380 SOL ($207,000, 3:1 ratio with market cap of $69,000).
- **Creator's Initial Purchase**:
  - 0.333 SOL ($50), included in the 1,380 SOL ($207,000).
- **Platform Fees**:
  - Creator's purchase: 0.333 SOL ($50), 0% fees → 0 SOL ($0).
  - Remaining volume: 1,380 SOL ($207,000) - 0.333 SOL ($50) = 1,379.667 SOL ($206,950).
  - Fees collected: 1,379.667 SOL × 0.0025 = 3.45 SOL ($517.50).
- **Tokens in Circulation (Pre-LP)**:
  - Total: 1B.
  - Development: 10M.
  - Burned: 300M.
  - Initial circulation: 1B - 10M - 300M = 690M.
- **Price per Token (Pre-LP)**:
  - Market cap: $69,000.
  - Tokens: 690M.
  - Price: $69,000 ÷ 690M = $0.0001.
- **LP Adjustment**:
  - 307 SOL ($46,050) worth of tokens.
  - $46,050 ÷ $0.0001 = 460.5M tokens.
  - Tokens in circulation after LP: 690M - 460.5M = 229.5M.
- **Final Price per Token**:
  - Market cap: $69,000.
  - Tokens: 229.5M.
  - Price: $69,000 ÷ 229.5M = $0.00030065.

### Financials (Standard Creator) 💵
- **Vault**: 1,380 SOL ($207,000).
- **LP**: 614 SOL ($92,100).
- **Remaining in Vault**: 1,380 SOL ($207,000) - 614 SOL ($92,100) = 766 SOL ($114,900).
- **Expenses**:
  - Platform Fee Refunds: 3.45 SOL ($517.50).
  - Creator Reward: 10 SOL ($1,500).
  - Milestone Reward: 2 SOL ($300) (assumed achieved).
  - Network Fees (platform-paid): 0.053 SOL ($7.95).
  - Referral Bonus: 0.5 SOL ($75).
  - Total: 3.45 + 10 + 2 + 0.053 + 0.5 = 16.003 SOL ($2,400.45).
- **Profit in Vault**: 766 SOL ($114,900) - 16.003 SOL ($2,400.45) = 749.997 SOL ($112,499.55).
- **Mitigating Volatility**:
  - 50% in USDC: 749.997 ÷ 2 = 374.9985 SOL → $56,249.78.
  - 50% in SOL: 374.9985 SOL ($56,249.78, fluctuates with SOL price).
- **Profit Margin**: $56,249.78 ÷ $207,000 = 27.17%.

### Financials (Promotions Creator) 💵
- **Expenses**:
  - Creator Reward: 15 SOL ($2,250).
  - Total: 3.45 + 15 + 2 + 0.053 + 0.5 = 21.003 SOL ($3,150.45).
- **Profit in Vault**: 766 SOL ($114,900) - 21.003 SOL ($3,150.45) = 744.997 SOL ($111,749.55).
- **Mitigating Volatility**:
  - 50% in USDC: 744.997 ÷ 2 = 372.4985 SOL → $55,874.78.
  - 50% in SOL: 372.4985 SOL ($55,874.78).
- **Profit Margin**: $55,874.78 ÷ $207,000 = 27%.

### Financials (Influencers/Teams/Discord Creator) 💵
- **Expenses**:
  - Creator Reward: 20 SOL ($3,000).
  - Total: 3.45 + 20 + 2 + 0.053 + 0.5 = 26.003 SOL ($3,900.45).
- **Profit in Vault**: 766 SOL ($114,900) - 26.003 SOL ($3,900.45) = 739.997 SOL ($110,999.55).
- **Mitigating Volatility**:
  - 50% in USDC: 739.997 ÷ 2 = 369.9985 SOL → $55,499.78.
  - 50% in SOL: 369.9985 SOL ($55,499.78).
- **Profit Margin**: $55,499.78 ÷ $207,000 = 26.81%.

## Scenario Analysis (Different Volume:Market Cap Ratios) 🔍

### Scenario 1: 2:1 Ratio
- **Volume Accumulated**: $69,000 × 2 = 920 SOL ($138,000).
- **Platform Fees**:
  - Creator's purchase: 0.333 SOL ($50), 0% fees → 0 SOL ($0).
  - Remaining volume: 920 SOL ($138,000) - 0.333 SOL ($50) = 919.667 SOL ($137,950).
  - Fees collected: 919.667 SOL × 0.0025 = 2.3 SOL ($345).
- **Vault After LP**: 920 SOL ($138,000) - 614 SOL ($92,100) = 306 SOL ($45,900).
- **Expenses (Standard)**:
  - Fee Refunds: 2.3 SOL ($345).
  - Total Expenses: 2.3 + 10 + 2 + 0.053 + 0.5 = 14.853 SOL ($2,227.95).
- **Profit in Vault**: 306 SOL ($45,900) - 14.853 SOL ($2,227.95) = 291.147 SOL ($43,672.05).
- **Mitigating Volatility**:
  - 50% in USDC: 291.147 ÷ 2 = 145.5735 SOL → $21,836.03.
  - 50% in SOL: 145.5735 SOL ($21,836.03).
- **Profit Margin**: $21,836.03 ÷ $138,000 = 15.82%.

### Scenario 2: 4:1 Ratio
- **Volume Accumulated**: $69,000 × 4 = 1,840 SOL ($276,000).
- **Platform Fees**:
  - Creator's purchase: 0.333 SOL ($50), 0% fees → 0 SOL ($0).
  - Remaining volume: 1,840 SOL ($276,000) - 0.333 SOL ($50) = 1,839.667 SOL ($275,950).
  - Fees collected: 1,839.667 SOL × 0.0025 = 4.6 SOL ($690).
- **Vault After LP**: 1,840 SOL ($276,000) - 614 SOL ($92,100) = 1,226 SOL ($183,900).
- **Expenses (Standard)**:
  - Fee Refunds: 4.6 SOL ($690).
  - Total Expenses: 4.6 + 10 + 2 + 0.053 + 0.5 = 17.153 SOL ($2,572.95).
- **Profit in Vault**: 1,226 SOL ($183,900) - 17.153 SOL ($2,572.95) = 1,208.847 SOL ($181,327.05).
- **Mitigating Volatility**:
  - 50% in USDC: 1,208.847 ÷ 2 = 604.4235 SOL → $90,663.53.
  - 50% in SOL: 604.4235 SOL ($90,663.53).
- **Profit Margin**: $90,663.53 ÷ $276,000 = 32.85%.

### Scenario 3: 2.5:1 Ratio
- **Volume Accumulated**: $69,000 × 2.5 = 1,150 SOL ($172,500).
- **Platform Fees**:
  - Creator's purchase: 0.333 SOL ($50), 0% fees → 0 SOL ($0).
  - Remaining volume: 1,150 SOL ($172,500) - 0.333 SOL ($50) = 1,149.667 SOL ($172,450).
  - Fees collected: 1,149.667 SOL × 0.0025 = 2.87 SOL ($430.50).
- **Vault After LP**: 1,150 SOL ($172,500) - 614 SOL ($92,100) = 536 SOL ($80,400).
- **Expenses (Standard)**:
  - Fee Refunds: 2.87 SOL ($430.50).
  - Total Expenses: 2.87 + 10 + 2 + 0.053 + 0.5 = 15.423 SOL ($2,313.45).
- **Profit in Vault**: 536 SOL ($80,400) - 15.423 SOL ($2,313.45) = 520.577 SOL ($78,086.55).
- **Mitigating Volatility**:
  - 50% in USDC: 520.577 ÷ 2 = 260.2885 SOL → $39,043.28.
  - 50% in SOL: 260.2885 SOL ($39,043.28).
- **Profit Margin**: $39,043.28 ÷ $172,500 = 22.63%.

## Summary Tables 📊

### Financial Summary (Standard Creator)
| **Scenario** | **Volume (SOL/USD)** | **Profit (SOL/USD)** | **Profit (USDC)** | **Profit Margin** |
| --- | --- | --- | --- | --- |
| 2:1 Ratio | 920 SOL ($138,000) | 291.147 SOL ($43,672.05) | $21,836.03 | 15.82% |
| 2.5:1 Ratio | 1,150 SOL ($172,500) | 520.577 SOL ($78,086.55) | $39,043.28 | 22.63% |
| 3:1 Ratio (Base) | 1,380 SOL ($207,000) | 749.997 SOL ($112,499.55) | $56,249.78 | 27.17% |
| 4:1 Ratio | 1,840 SOL ($276,000) | 1,208.847 SOL ($181,327.05) | $90,663.53 | 32.85% |

### Financial Summary (Promotions Creator)
| **Scenario** | **Volume (SOL/USD)** | **Profit (SOL/USD)** | **Profit (USDC)** | **Profit Margin** |
| --- | --- | --- | --- | --- |
| 2:1 Ratio | 920 SOL ($138,000) | 286.147 SOL ($42,922.05) | $21,461.03 | 15.55% |
| 2.5:1 Ratio | 1,150 SOL ($172,500) | 515.577 SOL ($77,336.55) | $38,668.28 | 22.42% |
| 3:1 Ratio (Base) | 1,380 SOL ($207,000) | 744.997 SOL ($111,749.55) | $55,874.78 | 27% |
| 4:1 Ratio | 1,840 SOL ($276,000) | 1,203.847 SOL ($180,577.05) | $90,288.53 | 32.71% |

### Financial Summary (Influencers/Teams/Discord Creator)
| **Scenario** | **Volume (SOL/USD)** | **Profit (SOL/USD)** | **Profit (USDC)** | **Profit Margin** |
| --- | --- | --- | --- | --- |
| 2:1 Ratio | 920 SOL ($138,000) | 281.147 SOL ($42,172.05) | $21,086.03 | 15.28% |
| 2.5:1 Ratio | 1,150 SOL ($172,500) | 510.577 SOL ($76,586.55) | $38,293.28 | 22.20% |
| 3:1 Ratio (Base) | 1,380 SOL ($207,000) | 739.997 SOL ($110,999.55) | $55,499.78 | 26.81% |
| 4:1 Ratio | 1,840 SOL ($276,000) | 1,198.847 SOL ($179,827.05) | $89,913.53 | 32.58% |

## Alignment with Degen Audit ✅
- **NoMint**: Recommended to disable minting after token creation to prevent dilution.
- **Blacklist**: No blacklist function in the contract (assumed, to be confirmed).
- **Burn**: 30% (300M tokens) burned, aligning with best practices.
- **Top10/Insiders**: Small allocation to creator (105,000 tokens from creation fee), no pre-sales or team allocations, minimizing concentration risks.

## Comparison with Pump.fun ⚖️
| **Feature** | **BlitzHub** | **Pump.fun** |
| --- | --- | --- |
| **Creation Fee** | 0.01 SOL ($1.50) (covers network fees + tokens) | 0.02 SOL ($3) (revenue for platform) |
| **Creator Incentives** | 10-20 SOL ($1,500-$3,000) + 2 SOL ($300) for $100K in 24h | 6 SOL ($900) per graduation |
| **Platform Fees** | 0%-0.5% (avg 0.25%), fully refunded | 1% (not refunded) |
| **Graduation Market Cap** | $69,000 | 69,000 RAY (~$138,000 @ $2/RAY) |
| **Liquidity Pool** | 614 SOL ($92,100, slippage 10.8%) | ~667 SOL (~$100,000, slippage ~5%-10%) |
| **Profit per Graduation** | 739.997-749.997 SOL ($110,999-$112,499 total, $55,499-$56,249 USDC) | ~400 SOL (~$60,000) |
| **Volatility Mitigation** | 50% profit in USDC | Partial conversion to USDC |

## Recommendations 📋
- Disable minting in the token contract to align with "NoMint: Yes".
- Consider gradual burning of the 10M development tokens to further reduce supply over time.
