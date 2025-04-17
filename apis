# BlitzHub Complete API Requirements for Token Maturation Platform

**Context**: APIs for BlitzHub, a Solana-based token maturation platform (Web3 auth via Phantom/Solflare, ~1000 users, ~10,000 req/s Backend, ~70,000 tx/h Solana). Backend runs on Fastify (EU-BE-01, AU-BE-01, SA-BE-01), integrates with Solana RPC, Helius Failover, RabbitMQ, Redis, Oracle ADB, Vault, Wazuh, Prometheus, Grafana, and Loki. SLOs: <50ms latency for APIs, <25ms for assets.

**Purpose**: Enable token transactions (buy, sell, stake), user authentication, token listing and details, advanced trading (TP/SL), transaction history, real-time chat, and internal management, ensuring scalability, security, and low latency.

## 1. Token Transaction APIs

### 1.1. Trade Tokens (Buy/Sell with TP/SL)

- **Endpoint**: `/api/v1/trade`
- **Description**: Executes a buy/sell trade with optional Take Profit (TP) and Stop Loss (SL), enqueues via RabbitMQ.
- **Method**: POST
- **Parameters**:
  - `userId` (string, required): User identifier from Phantom/Solflare.
  - `type` (string, required): Trade type (`buy` or `sell`).
  - `amount` (number, required): Amount in SOL.
  - `tokenId` (string, required): Token identifier (ex.: BLZ).
  - `signature` (string, required): Web3 signature for authentication.
  - `takeProfit` (number, optional): TP price in USD.
  - `stopLoss` (number, optional): SL price in USD.
- **Response**:
  - **200**: `{ "txId": "xyz789", "status": "queued", "tp": 0.6, "sl": 0.4 }`
  - **400**: `{ "error": "Invalid signature" }`
  - **500**: `{ "error": "Trade failed" }`
- **Dependencies**:
  - RabbitMQ (EU-MON-01, TCP 5672): Enqueues trade (`trade_queue`).
  - Solana RPC (EU-SOL-01, TCP 8899): Submits transaction.
  - Helius RPC Proxy (EU-HELIUS-01): Failover for Solana RPC.
  - Oracle ADB (EU-DB-01): Verifies user balance, stores TP/SL rules.
  - Redis: Caches user session and trade state.
  - Vault (EU-SEC-01): Stores `helius_api_key`, Solana keys.
  - Backend Logic: Monitors price (via Helius) to execute TP/SL.
- **Security**:
  - Web3 auth: Validate `signature` via Phantom/Solflare.
  - Balance check: Query Oracle ADB (`SELECT balance FROM user_tokens WHERE user_id = ?`).
  - Rate limit: 100 req/min per `userId` (Redis).
  - Firewall: `ufw allow 3000/tcp` (Fastify).
  - Wazuh: Monitor for SQL injection or unauthorized access.
- **SLO**: <50ms.
- **Example**:
  ```http
  POST /api/v1/trade
  Content-Type: application/json
  {
    "userId": "user123",
    "type": "buy",
    "amount": 1,
    "tokenId": "BLZ",
    "signature": "sig012",
    "takeProfit": 0.6,
    "stopLoss": 0.4
  }
  ---
  200 OK
  {
    "txId": "xyz789",
    "status": "queued",
    "tp": 0.6,
    "sl": 0.4
  }
  ```

### 1.2. Stake Tokens

- **Endpoint**: `/api/v1/stake`
- **Description**: Stakes tokens for rewards, enqueues via RabbitMQ.
- **Method**: POST
- **Parameters**:
  - `userId` (string, required): User identifier.
  - `amount` (number, required): Token amount to stake.
  - `tokenId` (string, required): Token identifier.
  - `signature` (string, required): Web3 signature.
- **Response**:
  - **200**: `{ "txId": "ghi789", "status": "queued" }`
  - **400**: `{ "error": "Invalid amount" }`
  - **500**: `{ "error": "Staking failed" }`
- **Dependencies**:
  - RabbitMQ: Enqueues staking transaction (`stake_queue`).
  - Solana RPC/Helius: Submits staking transaction.
  - Oracle ADB: Updates staking records.
  - Redis: Caches staking state.
- **Security**:
  - Web3 auth: Validate `signature`.
  - Rate limit: 50 req/min per `userId`.
  - Vault: Stores Solana staking keys.
- **SLO**: <50ms.
- **Example**:
  ```http
  POST /api/v1/stake
  Content-Type: application/json
  {
    "userId": "user123",
    "amount": 200,
    "tokenId": "BLZ",
    "signature": "sig012"
  }
  ---
  200 OK
  {
    "txId": "ghi789",
    "status": "queued"
  }
  ```

### 1.3. Get Transaction Status

- **Endpoint**: `/api/v1/tx`
- **Description**: Checks status of a transaction (trade, stake).
- **Method**: GET
- **Parameters**:
  - `txId` (string, required, query): Transaction ID.
- **Response**:
  - **200**: `{ "txId": "xyz789", "status": "confirmed", "blockTime": 1623456789 }`
  - **404**: `{ "error": "Transaction not found" }`
- **Dependencies**:
  - Solana RPC/Helius: Queries transaction status (`getTransaction`).
  - Redis: Caches status (TTL 10min).
  - Oracle ADB: Logs transaction details.
- **Security**:
  - JWT auth: Validate token in `Authorization` header.
  - Rate limit: 200 req/min per `txId`.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/tx?txId=xyz789
  Authorization: Bearer jwt123
  ---
  200 OK
  {
    "txId": "xyz789",
    "status": "confirmed",
    "blockTime": 1623456789
  }
  ```

## 2. User Management APIs

### 2.1. Authenticate User

- **Endpoint**: `/api/v1/auth`
- **Description**: Authenticates user via Web3 wallet (Phantom/Solflare), issues JWT.
- **Method**: POST
- **Parameters**:
  - `publicKey` (string, required): Wallet public key.
  - `signature` (string, required): Signed message for verification.
  - `message` (string, required): Original message signed.
- **Response**:
  - **200**: `{ "token": "jwt123", "expiresIn": 3600 }`
  - **401**: `{ "error": "Invalid signature" }`
- **Dependencies**:
  - Redis: Stores JWT session (TTL 1h).
  - Vault: Stores JWT secret.
  - Fastify: Handles JWT issuance.
- **Security**:
  - Validate `signature` against `publicKey` and `message`.
  - Rate limit: 10 req/min per `publicKey`.
  - Wazuh: Monitor for brute-force attempts.
- **SLO**: <30ms.
- **Example**:
  ```http
  POST /api/v1/auth
  Content-Type: application/json
  {
    "publicKey": "pubkey123",
    "signature": "sig345",
    "message": "BlitzHub login"
  }
  ---
  200 OK
  {
    "token": "jwt123",
    "expiresIn": 3600
  }
  ```

### 2.2. Get User Balance

- **Endpoint**: `/api/v1/balance`
- **Description**: Retrieves user token balance from Oracle ADB and Solana.
- **Method**: GET
- **Parameters**:
  - `userId` (string, required, query): User identifier.
  - `tokenId` (string, optional, query): Token identifier (default: all tokens).
- **Response**:
  - **200**: `{ "userId": "user123", "balances": [{ "tokenId": "BLZ", "amount": 1000.5 }] }`
  - **404**: `{ "error": "User not found" }`
- **Dependencies**:
  - Oracle ADB: Queries user balances (`SELECT * FROM user_tokens WHERE user_id = ?`).
  - Solana RPC/Helius: Verifies on-chain balance.
  - Redis: Caches balance (TTL 1min).
- **Security**:
  - JWT auth: Validate token in `Authorization` header.
  - Rate limit: 200 req/min per `userId`.
  - Wazuh: Monitor for unauthorized queries.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/balance?userId=user123
  Authorization: Bearer jwt123
  ---
  200 OK
  {
    "userId": "user123",
    "balances": [
      { "tokenId": "BLZ", "amount": 1000.5 }
    ]
  }
  ```

## 3. Token Listing and Details APIs

### 3.1. Get Token List by Category

- **Endpoint**: `/api/v1/tokens/list`
- **Description**: Retrieves a list of tokens filtered by category (new, trending, about-to-graduate).
- **Method**: GET
- **Parameters**:
  - `category` (string, required, query): Category filter (`new`, `trending`, `about-to-graduate`).
  - `limit` (number, optional, query): Number of tokens to return (default: 10).
  - `offset` (number, optional, query): Pagination offset (default: 0).
- **Response**:
  - **200**: `{ "tokens": [{ "tokenId": "BLZ", "name": "BlitzToken", "liquidity": 150000, "holders": 200, "mcap": 41000, "age": "6m 3ts", "chartData": [{ "timestamp": 1623456789, "price": 0.5 }] }] }`
  - **400**: `{ "error": "Invalid category" }`
- **Dependencies**:
  - Oracle ADB: Queries token data (`SELECT * FROM tokens WHERE category = ? LIMIT ? OFFSET ?`).
  - Redis: Caches results (TTL 5min).
  - Helius RPC: Fetches on-chain metrics (liquidity, holders) if cache miss.
- **Security**:
  - Public endpoint, no auth required.
  - Rate limit: 500 req/min per IP (Redis).
  - Wazuh: Monitor for DDoS patterns.
- **SLO**: <30ms.
- **Example**:
  ```http
  GET /api/v1/tokens/list?category=new&limit=5
  ---
  200 OK
  {
    "tokens": [
      {
        "tokenId": "BLZ",
        "name": "BlitzToken",
        "liquidity": 150000,
        "holders": 200,
        "mcap": 41000,
        "age": "6m 3ts",
        "chartData": [
          { "timestamp": 1623456789, "price": 0.5 }
        ]
      }
    ]
  }
  ```

### 3.2. Get Token Details

- **Endpoint**: `/api/v1/token`
- **Description**: Retrieves detailed metadata for a specific token (combines previous `/api/v1/token` and `/api/v1/token/details`).
- **Method**: GET
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier.
- **Response**:
  - **200**: `{ "tokenId": "BLZ", "name": "BlitzToken", "description": "A token for BlitzHub", "socialLinks": { "twitter": "url", "telegram": "url" }, "contractAddress": "0x1234...5678", "creator": "0x1234...5678", "price": 0.5, "supply": 1000000, "mcap": 41000, "volume24h": 15500, "holders": 200, "tokenTalk": 3, "chartData": [{ "timestamp": 1623456789, "price": 0.5 }], "liquidity": 150000, "age": "6m 3ts" }`
  - **404**: `{ "error": "Token not found" }`
- **Dependencies**:
  - Oracle ADB: Stores token metadata.
  - Helius RPC: Fetches on-chain data (contract address, creator, price, supply).
  - Redis: Caches response (TTL 5min).
- **Security**:
  - Public endpoint, no auth required.
  - Rate limit: 500 req/min per IP.
  - Wazuh: Monitor for suspicious queries.
- **SLO**: <30ms.
- **Example**:
  ```http
  GET /api/v1/token?tokenId=BLZ
  ---
  200 OK
  {
    "tokenId": "BLZ",
    "name": "BlitzToken",
    "description": "A token for BlitzHub",
    "socialLinks": {
      "twitter": "url",
      "telegram": "url"
    },
    "contractAddress": "0x1234...5678",
    "creator": "0x1234...5678",
    "price": 0.5,
    "supply": 1000000,
    "mcap": 41000,
    "volume24h": 15500,
    "holders": 200,
    "tokenTalk": 3,
    "chartData": [
      { "timestamp": 1623456789, "price": 0.5 }
    ],
    "liquidity": 150000,
    "age": "6m 3ts"
  }
  ```

### 3.3. Get Token Activity

- **Endpoint**: `/api/v1/token/activity`
- **Description**: Retrieves transaction history for a token (buy/sell activity).
- **Method**: GET
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier.
  - `limit` (number, optional, query): Number of transactions (default: 10).
  - `offset` (number, optional, query): Pagination offset (default: 0).
- **Response**:
  - **200**: `{ "activity": [{ "type": "buy", "totalUsd": 101.6, "amount": 26000000, "price": 0.0039858, "maker": "BZZ...TDA", "timestamp": 1623456789 }] }`
  - **404**: `{ "error": "Token not found" }`
- **Dependencies**:
  - Oracle ADB: Logs transaction history.
  - Solana RPC/Helius: Fetches on-chain transactions.
  - Redis: Caches results (TTL 1min).
- **Security**:
  - Public endpoint, no auth required.
  - Rate limit: 200 req/min per IP.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/token/activity?tokenId=BLZ&limit=5
  ---
  200 OK
  {
    "activity": [
      {
        "type": "buy",
        "totalUsd": 101.6,
        "amount": 26000000,
        "price": 0.0039858,
        "maker": "BZZ...TDA",
        "timestamp": 1623456789
      }
    ]
  }
  ```

### 3.4. Get Token Traders

- **Endpoint**: `/api/v1/token/traders`
- **Description**: Retrieves list of traders for a token.
- **Method**: GET
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier.
  - `limit` (number, optional, query): Number of traders (default: 10).
  - `offset` (number, optional, query): Pagination offset (default: 0).
- **Response**:
  - **200**: `{ "traders": [{ "maker": "BZZ...TDA", "amount": 26000000 }] }`
  - **404**: `{ "error": "Token not found" }`
- **Dependencies**:
  - Oracle ADB: Stores trader data.
  - Solana RPC/Helius: Fetches on-chain trader info.
  - Redis: Caches results (TTL 1min).
- **Security**:
  - Public endpoint, no auth required.
  - Rate limit: 200 req/min per IP.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/token/traders?tokenId=BLZ&limit=5
  ---
  200 OK
  {
    "traders": [
      {
        "maker": "BZZ...TDA",
        "amount": 26000000
      }
    ]
  }
  ```

### 3.5. Get Token Holders

- **Endpoint**: `/api/v1/token/holders`
- **Description**: Retrieves list of holders for a token.
- **Method**: GET
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier.
  - `limit` (number, optional, query): Number of holders (default: 10).
  - `offset` (number, optional, query): Pagination offset (default: 0).
- **Response**:
  - **200**: `{ "holders": [{ "maker": "BZZ...TDA", "amount": 26000000 }] }`
  - **404**: `{ "error": "Token not found" }`
- **Dependencies**:
  - Oracle ADB: Stores holder data.
  - Solana RPC/Helius: Fetches on-chain holder info.
  - Redis: Caches results (TTL 1min).
- **Security**:
  - Public endpoint, no auth required.
  - Rate limit: 200 req/min per IP.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/token/holders?tokenId=BLZ&limit=5
  ---
  200 OK
  {
    "holders": [
      {
        "maker": "BZZ...TDA",
        "amount": 26000000
      }
    ]
  }
  ```

## 4. Chat APIs

### 4.1. Chat WebSocket

- **Endpoint**: `/ws/chat`
- **Description**: WebSocket for real-time chat in token page.
- **Method**: WebSocket (upgrade from HTTP)
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier for chat room.
  - `userId` (string, required, header): User identifier (via JWT).
- **Messages**:
  - **Client to Server**: `{ "type": "message", "content": "Alguém já comprou BLZ?", "userId": "user123" }`
  - **Server to Client**: `{ "type": "message", "content": "Alguém já comprou BLZ?", "userId": "user123", "timestamp": 1623456789 }`
- **Dependencies**:
  - Fastify: Uses `fastify-websocket` for WebSocket.
  - Redis: Stores chat messages (TTL 24h).
  - Oracle ADB: Persists messages for audit.
- **Security**:
  - JWT auth: Validate token in WebSocket handshake.
  - Rate limit: 10 messages/min per `userId`.
  - Wazuh: Monitor for spam or malicious content.
- **SLO**: <100ms for message delivery.
- **Example**:
  ```javascript
  // Client-side (React)
  const ws = new WebSocket('ws://backend:3000/ws/chat?tokenId=BLZ');
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'message',
      content: 'Alguém já comprou BLZ?',
      userId: 'user123'
    }));
  };
  ws.onmessage = (event) => {
    console.log(JSON.parse(event.data));
    // { type: "message", content: "Alguém já comprou BLZ?", userId: "user123", timestamp: 1623456789 }
  };
  ```

### 4.2. Get Chat History

- **Endpoint**: `/api/v1/chat/history`
- **Description**: Retrieves chat history for a token.
- **Method**: GET
- **Parameters**:
  - `tokenId` (string, required, query): Token identifier.
  - `limit` (number, optional, query): Number of messages (default: 50).
  - `offset` (number, optional, query): Pagination offset (default: 0).
- **Response**:
  - **200**: `{ "messages": [{ "userId": "user123", "content": "Alguém já comprou BLZ?", "timestamp": 1623456789 }] }`
  - **404**: `{ "error": "Chat not found" }`
- **Dependencies**:
  - Redis: Caches recent messages (TTL 24h).
  - Oracle ADB: Stores full chat history.
- **Security**:
  - JWT auth: Validate token in `Authorization` header.
  - Rate limit: 100 req/min per `userId`.
- **SLO**: <40ms.
- **Example**:
  ```http
  GET /api/v1/chat/history?tokenId=BLZ&limit=10
  Authorization: Bearer jwt123
  ---
  200 OK
  {
    "messages": [
      {
        "userId": "user123",
        "content": "Alguém já comprou BLZ?",
        "timestamp": 1623456789
      }
    ]
  }
  ```

## 5. Internal Management APIs

### 5.1. Health Check

- **Endpoint**: `/api/v1/health`
- **Description**: Verifies Backend service status for Load Balancer.
- **Method**: GET
- **Parameters**: None
- **Response**:
  - **200**: `{ "status": "ok", "uptime": 123456 }`
  - **503**: `{ "status": "error", "error": "Database unavailable" }`
- **Dependencies**:
  - Fastify: Exposes endpoint.
  - Oracle ADB: Checks DB connection.
  - Redis: Checks cache connection.
- **Security**:
  - Restricted to Load Balancer IPs (10.0.2.0/24, 10.0.3.0/24).
  - Firewall: `ufw allow from 10.0.2.0/24 to any port 3000`.
- **SLO**: <20ms.
- **Example**:
  ```http
  GET /api/v1/health
  ---
  200 OK
  {
    "status": "ok",
    "uptime": 123456
  }
  ```

### 5.2. Metrics

- **Endpoint**: `/api/v1/metrics`
- **Description**: Exposes Prometheus metrics for monitoring.
- **Method**: GET
- **Parameters**: None
- **Response**:
  - **200**: Prometheus text format (ex.: `fastify_request_duration_seconds...`)
- **Dependencies**:
  - Fastify: Integrates `prom-client`.
  - Prometheus (EU-MON-01): Scrapes metrics (TCP 9090).
- **Security**:
  - Restricted to Prometheus IPs (10.0.5.0/24).
  - Firewall: `ufw allow from 10.0.5.0/24 to any port 3000`.
- **SLO**: <20ms.
- **Example**:
  ```http
  GET /api/v1/metrics
  ---
  200 OK
  # TYPE fastify_request_duration_seconds histogram
  fastify_request_duration_seconds_bucket{le="0.05"} 1000
  ```

## Implementation Notes

- **Fastify Routes**: Implement in `/app/routes/api/v1/*` (ex.: `trade.js`, `tokens.js`, `chat.js`), use `fastify.register` for modularity.
- **WebSocket**: Use `fastify-websocket` for `/ws/chat`. Example setup:
  ```javascript
  fastify.register(require('fastify-websocket'));
  fastify.get('/ws/chat', { websocket: true }, (connection, req) => {
    const { tokenId } = req.query;
    connection.on('message', (message) => {
      const data = JSON.parse(message);
      // Broadcast to all clients in tokenId room
      connection.socket.send(JSON.stringify({ ...data, timestamp: Date.now() }));
    });
  });
  ```
- **Rate Limiting**: Use `fastify-rate-limit` with Redis backend.
- **Error Handling**: Standardize errors (ex.: `{ "error": "message" }`) with Fastify schemas.
- **Monitoring**: Instrument APIs with `prom-client` (ex.: `fastify_request_duration_seconds`, `websocket_messages_total`).
- **Ansible Deployment**:
  - Create playbook to deploy routes and dependencies (ex.: `fastify-websocket`).
  - Example:
    ```yaml
    - name: Install fastify-websocket
      npm:
        name: fastify-websocket
        path: /app
    - name: Deploy API routes
      copy:
        src: routes/api/v1/
        dest: /app/routes/api/v1/
        owner: app
        group: app
        mode: '0644'
    - name: Restart Fastify
      command: pm2 restart fastify
    ```
- **Testing**: Use Jest for unit tests (ex.: test `/api/v1/trade` with mock Solana RPC).
- **Scaling**: APIs support ~10,000 req/s via Load Balancer (Least Connections) and Redis caching.

## Security Considerations

- **Web3 Auth**: Validate signatures with Solana Web3.js (`verifySignature`).
- **Secrets**: Store API keys, DB credentials in Vault (ex.: `secret/helius_api_key`).
- **Wazuh**: Monitor endpoints for anomalies (ex.: `wazuh_alerts_total > 50`).
- **Rate Limits**: Enforce via Redis to prevent abuse.
- **Chat Moderation**: Implement content filtering (ex.: profanity filter) in `/ws/chat`.

## Potential Tweaks

- **Caching**: Adjust Redis TTL (ex.: 1min to 5min for `/api/v1/balance`) if cache hits are low.
- **Latency**: Add CDN (ex.: Cloudflare) for `/api/v1/token` if global latency >30ms.
- **Chat Scalability**: Use Redis Pub/Sub for `/ws/chat` if >1000 concurrent users per token chat.
- **TP/SL Logic**: Run a separate Fastify worker to monitor prices and execute TP/SL trades.
- **Rate Limits**: Tighten limits (ex.: 50 req/min for `/api/v1/auth`) if brute-force detected.
