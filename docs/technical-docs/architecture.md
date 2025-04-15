# Architecture Description

## Description
Overview of BlitzHub’s architecture, including flow diagrams (e.g., purchase flow in Mermaid), component descriptions (frontend, backend, Solana), and inter-relations (e.g., Redis for caching).

## How to Develop
- **Audience**: Developers and technical teams.
- **Tone**: Technical, focusing on clarity and precision.
- **Format**: Markdown with Mermaid diagrams and detailed explanations.

## Steps to Build
- Introduce the architecture: "BlitzHub consists of frontend, backend, and Solana nodes."
- List components: Frontend (React, EU-FE-01), Backend (Fastify, EU-BE-01), Solana (EU-SOL-01).
- Describe inter-relations: E.g., "Frontend calls `/api/buy`, which queues a transaction in RabbitMQ."
- Add diagrams: Use existing flows (e.g., purchase, graduation) in Mermaid.
- Explain dependencies: Redis (cache), Cloudflare (CDN), Vault (keys).

# Architecture Overview

    ## System Architecture

    - **Backends**: Two VMs (A1.Flex, 4 OCPU each):
      - EU-BE-01 (active).
      - NA-BE-01 (active).
      - Mode: Active-Active, with dynamic traffic distribution based on region (Europe -> EU-BE-01, North America -> NA-BE-01, fallback to 50/50).
      - Load: Up to 50 transactions per second per backend (total 100 transactions per second normally, 20 in peaks).

    - **Load Balancer**: Cloudflare
      - Distributes traffic dynamically based on user region.
      - Fallback: 50/50 round-robin if region-based routing fails.
      - Handles 16,000 WebSocket connections (8,000 per backend).

    - **Database**: Autonomous Database (TokensDBEUFE01, 1 OCPU, 1,000 QPS).
      - Stores token metrics, user balances, transactions, price history, and user data.
      - Reduces dependency on Solana nodes by storing data locally.

    - **Messaging**: RabbitMQ
      - Queues trades per token (`trades:{tokenAddress}`) to avoid contention.
      - Ensures sequential processing of trades for each token.

    - **Cache**: Redis
      - Pub/Sub for WebSocket updates across backends.
      - Caches metrics with 30-second TTL.

    - **Blockchain**: Solana
      - Used only for transaction confirmation (buy/sell), ~350ms per transaction.

    ## Calculations

    - **Bonding Curve and Indicators**:
      - Performed in the backend (`src/trade/executeTrade.js`).
      - Bonding Curve: \( \text{Price} = k \times \text{Supply}^n \), where \( k = 0.000000001 \), \( n = 1 \).
      - Indicators: Market Cap, Volume 24h, Liquidity, Holders, Age.
      - Results are stored in the `Tokens` table to avoid recalculation.

