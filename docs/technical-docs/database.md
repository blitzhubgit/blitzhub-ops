# Database Schema

    ## Tables

    ### Tokens
    - **Purpose**: Stores token metrics.
    - **Columns**:
      - `token_address` (VARCHAR, PK)
      - `name` (VARCHAR)
      - `current_supply` (DECIMAL)
      - `total_supply` (DECIMAL)
      - `market_cap` (DECIMAL)
      - `volume_24h` (DECIMAL)
      - `liquidity` (DECIMAL)
      - `holders_count` (INT)
      - `created_at` (TIMESTAMP)
    - **Indexes**:
      - `idx_tokens_created_at` (on `created_at`)
      - `idx_tokens_volume_24h` (on `volume_24h`)

    ### UserBalances
    - **Purpose**: Tracks user balances per token, used to calculate holders.
    - **Columns**:
      - `user_address` (VARCHAR, PK)
      - `token_address` (VARCHAR, PK)
      - `balance` (DECIMAL)
    - **Indexes**:
      - `idx_userbalances_token` (on `token_address`)

    ### Transactions
    - **Purpose**: Logs all buy/sell transactions.
    - **Columns**:
      - `transaction_id` (VARCHAR, PK)
      - `token_address` (VARCHAR)
      - `type` (VARCHAR)
      - `total_usd` (DECIMAL)
      - `amount` (DECIMAL)
      - `price` (DECIMAL)
      - `maker` (VARCHAR)
      - `timestamp` (TIMESTAMP)
    - **Indexes**:
      - `idx_transactions_token` (on `token_address`)
      - `idx_transactions_timestamp` (on `timestamp`)

    ### PriceHistory
    - **Purpose**: Stores candlesticks for TradingView.
    - **Columns**:
      - `token_address` (VARCHAR, PK)
      - `interval` (VARCHAR, PK)
      - `timestamp` (TIMESTAMP, PK)
      - `open` (DECIMAL)
      - `high` (DECIMAL)
      - `low` (DECIMAL)
      - `close` (DECIMAL)
      - `volume` (DECIMAL)
    - **Indexes**:
      - `idx_pricehistory_token_interval` (on `token_address`, `interval`)

    ### Users
    - **Purpose**: Stores user information.
    - **Columns**:
      - `user_address` (VARCHAR, PK)
      - `username` (VARCHAR)
      - `email` (VARCHAR)
      - `created_at` (TIMESTAMP)
      - `last_login` (TIMESTAMP)
    - **Indexes**:
      - `idx_users_email` (on `email`)
