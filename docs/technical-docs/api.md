# API Description

## Description
Documentation of all endpoints (e.g., `/api/token/{mint}`), including methods (GET, POST), parameters, responses, usage examples, and details on caching and monitoring.

## How to Develop
- **Audience**: Developers integrating with BlitzHub.
- **Tone**: Technical and concise.
- **Format**: Markdown with code examples (JSON, `curl`).

## Steps to Build
- List endpoints: `/api/create`, `/api/buy`, `/api/token/{mint}`, etc.
- For each endpoint, detail: Method (e.g., GET), parameters (e.g., `mint`), response (e.g., JSON from `/api/token/{mint}`).
- Add examples: E.g., `curl -X GET https://blitzhub.sol/api/token/0x1234...5678`.
- Include technical details: Cache (Redis, TTL 30s), monitoring (Prometheus `api_token_requests_total`).
- Finalize with notes: E.g., "Use `x-region` for regional routing."


# API Documentation

    ## Endpoints

    ### GET /api/tokens/list
    - **Description**: Fetches token data for the homepage.
    - **Response**:
      ```json
      {
        "newTokens": [
          { "tokenAddress": "abc", "name": "Maggie Justice", "liquidity": 1950, "marketCap": 41000, "holders": 150, "age": 391 }
        ],
        "trending": [...],
        "aboutToGraduate": [...]
      }
      ```

    ### GET /api/token/{contractAddress}/price-history
    - **Description**: Fetches historical candlesticks for TradingView.
    - **Query Parameters**:
      - `interval` (default: '1m')
    - **Response**:
      ```json
      [
        { "time": 1710000000000, "open": 0.00001, "high": 0.000015, "low": 0.000008, "close": 0.000012, "volume": 500 }
      ]
      ```

    ### POST /trade
    - **Description**: Submits a buy/sell transaction.
    - **Request Body**:
      ```json
      { "tokenAddress": "abc", "type": "buy", "amount": 1000, "userWallet": "wallet123" }
      ```
    - **Response**:
      ```json
      { "success": true }
      ```
    - **Error**:
      - HTTP 429 (Too Many Requests): Silent rejection if transaction limit exceeded.

    ## WebSocket

    ### URL: wss://eu-be.blitzhub.xyz/token/{contractAddress}/updates
    - **Messages**:
      ```json
      { "price": 0.000012, "marketCap": 41000, "volume24h": 5000, "liquidity": 1950, "holders": 150 }
      ```
