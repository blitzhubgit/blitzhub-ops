# BlitzHub Server and Service List (Complete with Enhanced Configuration and WebSocket Support)

**Infrastructure**: VCN 10.0.0.0/16, 15 Oracle Free Tier accounts, 9 subnets, 45 VMs (15 A1.Flex, 30 E2.1.Micro), 18 Load Balancers (15 Flexible, 3 Network)

**Purpose**: Token maturation platform on Solana, Web3 authentication (Phantom/Solflare), ~1000 concurrent users, ~25,000 req/s Frontend, ~10,000 req/s Backend, ~70,000 tx/h Solana. WebSocket support for ~10 real-time operations (e.g., transaction notifications, balance updates, Web3 auth status).

**Latency**: ~1-2ms intra-region, SLOs: <50ms APIs, <25ms assets, <50ms WebSocket messages

## 1. Frontend (5 accounts: EU-FE-01, NA-FE-01, SA-FE-01, AS-FE-01, AU-FE-01)

- **Subnet**: 10.0.1.0/24 (public)
- **VMs per account**:
  - **A1.Flex** (4 OCPUs, 24 GB RAM):
    - **React (18.3.0)**:
      - **Description**: Interactive web interface using JavaScript framework, renders dashboards and token forms (~100ms rendering). Added WebSocket support for real-time updates (e.g., transaction confirmations, balance updates).
      - **Context**: Displays transaction data (from Oracle ADB via Fastify), interacts with Solana (Web3.js for auth). Uses Vite for build, Tailwind CSS for styling, Recharts for charts, react-joyride for tutorials. WebSocket client (via `Socket.IO-client`) subscribes to events like transaction confirmations and balance updates. Sends logs to Loki via Promtail.
      - **Example**: User views dashboard, sees real-time balance update via WebSocket when a transaction is confirmed.
      - **Configuration Details**:
        - Arquivo: `/app/frontend/package.json`, `/app/frontend/vite.config.js`, `/app/frontend/src/services/websocket.js`.
        - Porta: `80` (via Nginx for HTTP), WebSocket via `wss://backend:3001/ws`.
        - Variáveis: `VITE_API_URL=http://backend:3000`, `VITE_WS_URL=wss://backend:3001`, `NODE_ENV=production`.
        - Limite: 2 GB RAM via PM2 (`--max-memory-restart 2G`).
      - **Dependencies**:
        - Serviços: Fastify (TCP 3000 for APIs, TCP 3001 for WebSocket), Nginx (TCP 80).
        - Ordem: 1. Nginx, 2. Fastify, 3. React.
      - **Security Settings**:
        - Segredo: Nenhum (configuração pública).
        - Firewall: `ufw allow 80/tcp` (via Nginx).
        - Permissões: `chown app:app /app/frontend -R; chmod 644 /app/frontend/dist/*`.
      - **Monitoring Rules**:
        - Métrica: `http_requests_total{job="react", endpoint="/dashboard"}`, `websocket_messages_received_total{job="react"}`.
        - Alerta: `alert: ReactHighLatency expr: rate(http_request_duration_seconds[5m]) > 0.1 for: 5m labels: { severity: "warning" }`, `alert: WebSocketDisconnect expr: rate(websocket_disconnect_total[5m]) > 0.1 for: 5m labels: { severity: "warning" }`.
        - Dashboard: Grafana query `sum(rate(http_requests_total{job="react"}[5m]))`, `sum(rate(websocket_messages_received_total{job="react"}[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO weekly at 03:00 UTC (`/backups/frontend_assets`, include `/app/frontend/src/services/websocket.js`).
        - Logrotate: `/var/log/react.log` (daily, 7 days retention).
        - Auto-scaling: Add A1.Flex if CPU >70% for 5min.
        - Atualização: Dependabot checks React and `Socket.IO-client` weekly.
      - **Rollback Strategy**:
        - Rollback: `argocd app rollback react --to-version v18.2.0`.
        - Condição: Failure in `/health` (HTTP 500 for 2min) or frequent WebSocket disconnections.
        - Fallback: React v18.2.0, disable WebSocket and fallback to HTTP polling.
    - **Nginx (1.24.0)**:
      - **Description**: Reverse proxy, handles HTTP traffic (port 80, cache TTL 10s) and WebSocket traffic (port 3001).
      - **Context**: Routes HTTP requests to React (port 80) and Fastify (port 3000). Routes WebSocket connections to Fastify (port 3001) with `Upgrade` and `Connection` headers. Integrates with ModSecurity for security.
      - **Example**: WebSocket connection to `/ws/transactions` is routed to Fastify WebSocket server.
      - **Configuration Details**:
        - Arquivo: `/etc/nginx/nginx.conf`, `/etc/nginx/conf.d/frontend.conf`.
        - Porta: `80` (HTTP), supports WebSocket via `wss://backend:3001`.
        - Variáveis: Nenhum.
        - Limite: 1 GB RAM, 1000 simultaneous connections (HTTP + WebSocket).
        - Configuração WebSocket:
          ```nginx
          location /ws/ {
              proxy_pass http://backend:3001;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "upgrade";
              proxy_read_timeout 3600s;
          }
          ```
      - **Dependencies**:
        - Serviços: React, Fastify (TCP 3000 for APIs, TCP 3001 for WebSocket).
        - Ordem: 1. Nginx, 2. React, 3. Fastify.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 80/tcp`.
        - Permissões: `chown nginx:nginx /etc/nginx -R; chmod 644 /etc/nginx/conf.d/*`.
      - **Monitoring Rules**:
        - Métrica: `nginx_connections_active`, `nginx_websocket_connections_active`.
        - Alerta: `alert: NginxOverload expr: nginx_connections_active > 800 for: 5m labels: { severity: "critical" }`, `alert: NginxWebSocketOverload expr: nginx_websocket_connections_active > 800 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(nginx_connections_active)`, `sum(nginx_websocket_connections_active)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/nginx_conf`).
        - Logrotate: `/var/log/nginx/*.log` (daily, 7 days retention).
        - Auto-scaling: Add A1.Flex if connections >800.
        - Atualização: `apt upgrade nginx` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install nginx=1.23.0`.
        - Condição: Failure in `/health` (HTTP 502 for 2min) or WebSocket connection failures.
        - Fallback: Nginx v1.23.0.

## 2. Backend (2 accounts: EU-BE-01, NA-BE-01)

- **Subnet**: 10.0.2.0/24 (public)
- **VMs per account**:
  - **A1.Flex**:
    - **Fastify (4.28.0)**:
      - **Description**: Node.js server for critical APIs (/api/v1/create, /api/v1/buy, /api/v1/auth, ~10,000 req/s) and WebSocket server for real-time operations (~10 operations, e.g., transaction notifications, balance updates, ~1000 concurrent connections).
      - **Context**: Handles API requests, queries Oracle ADB (TCP 1521), verifies Web3 auth (@solana/web3.js), publishes messages to RabbitMQ (buy_queue). Added WebSocket support via `fastify-websocket` for real-time updates (e.g., `/ws/transactions`, `/ws/balance`). WebSocket authenticates clients using Web3 signatures. Monitored by OpenTelemetry, logs to Loki.
      - **Example**: Client connects to `/ws/transactions`, receives `{ "event": "transaction_confirmed", "data": { "txId": "abc123" } }` after a Solana transaction.
      - **Configuration Details**:
        - Arquivo: `/app/config/fastify.js`, `/app/config/websocket.js`.
        - Porta: `3000` (APIs), `3001` (WebSocket).
        - Variáveis: `NODE_ENV=production`, `DB_HOST=adb_host`, `RABBITMQ_URL=amqp://rabbitmq:5672`, `WS_MAX_CONNECTIONS=1000`.
        - Limite: 2 GB RAM via PM2 (`--max-memory-restart 2G`).
      - **Dependencies**:
        - Serviços: Oracle ADB (TCP 1521), Redis (TCP 6379), RabbitMQ (TCP 5672).
        - Ordem: 1. Redis, 2. Oracle ADB, 3. RabbitMQ, 4. Fastify.
      - **Security Settings**:
        - Segredo: `secret/fastify/adb`, `secret/fastify/websocket_token` in Vault.
        - Firewall: `ufw allow 3000/tcp`, `ufw allow 3001/tcp`.
        - Permissões: `chown app:app /app/config -R; chmod 600 /app/config/fastify.js`, `chmod 600 /app/config/websocket.js`.
        - Autenticação WebSocket: Verify Web3 signature (Phantom/Solflare) during handshake.
      - **Monitoring Rules**:
        - Métrica: `http_requests_total{job="fastify", endpoint="/api/v1/buy"}`, `websocket_connections_active{job="fastify"}`.
        - Alerta: `alert: FastifyHighLatency expr: rate(http_request_duration_seconds[5m]) > 0.05 for: 5m labels: { severity: "critical" }`, `alert: WebSocketHighLatency expr: rate(websocket_message_duration_ms[5m]) > 50 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `avg(rate(http_request_duration_seconds[5m])) by (endpoint)`, `sum(websocket_connections_active{job="fastify"})`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily at 02:00 UTC (`/backups/fastify_logs`, `/backups/fastify_websocket_logs`).
        - Logrotate: `/var/log/fastify.log`, `/var/log/fastify_websocket.log` (daily, 7 days retention).
        - Auto-scaling: Add A1.Flex if CPU >70% or WebSocket connections >800 for 5min.
        - Atualização: Dependabot checks Fastify and `fastify-websocket` weekly.
      - **Rollback Strategy**:
        - Rollback: `argocd app rollback fastify --to-version v4.28.0`.
        - Condição: Failure in `/health` (HTTP 500 for 2min) or WebSocket `/ws/health` failure.
        - Fallback: Fastify v4.28.0, disable WebSocket and fallback to API polling.
  - **E2.1.Micro 1**:
    - **Redis (7.2.0)**:
      - **Description**: In-memory cache (~100,000 ops/s, allkeys-lru), stores API responses, sessions, and WebSocket Pub/Sub messages for real-time operations.
      - **Context**: Used by Fastify for API caching (TTL 1h) and WebSocket message coordination (Pub/Sub for transaction notifications). Integrates with Backend and Solana.
      - **Example**: Publishes transaction confirmation to `transactions` channel, consumed by Fastify WebSocket servers.
      - **Configuration Details**:
        - Arquivo: `/etc/redis/redis.conf`.
        - Porta: `6379`.
        - Variáveis: `maxmemory 512mb`, `allkeys-lru`, `notify-keyspace-events Ex`.
        - Limite: 512 MB RAM.
      - **Dependencies**:
        - Serviços: Nenhum.
        - Ordem: 1. Redis.
      - **Security Settings**:
        - Segredo: `secret/redis_password` in Vault.
        - Firewall: `ufw allow 6379/tcp`.
        - Permissões: `chown redis:redis /etc/redis -R; chmod 600 /etc/redis/redis.conf`.
      - **Monitoring Rules**:
        - Métrica: `redis_memory_used_bytes`, `redis_pubsub_messages_total`.
        - Alerta: `alert: RedisHighMemory expr: redis_memory_used_bytes > 500e6 for: 5m labels: { severity: "critical" }`, `alert: RedisPubSubFailure expr: rate(redis_pubsub_messages_total[5m]) == 0 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `redis_memory_used_bytes / redis_memory_max_bytes`, `sum(rate(redis_pubsub_messages_total[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/redis_dump.rdb`).
        - Logrotate: `/var/log/redis/redis.log` (daily, 7 days retention).
        - Atualização: `apt upgrade redis` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install redis=7.1.0`.
        - Condição: Cache failure (connection refused) or Pub/Sub failure.
        - Fallback: Redis v7.1.0.
- **Load Balancer**: Flexible (/health, Weighted Round Robin with WebSocket session persistence)
- **Integration**:
  - Receives API requests from Frontend (TCP 3000), WebSocket connections (TCP 3001).
  - Sends to Solana (TCP 8899).
  - Consumes RabbitMQ messages (buy_queue, transaction_notifications, TCP 5672).
  - Verifies Web3 auth (Phantom/Solflare signatures via @solana/web3.js).

## 3. Solana (2 accounts: EU-SOL-01, AS-SOL-01)

- **Subnet**: 10.0.3.0/24 (public)
- **VMs per account**:
  - **A1.Flex**:
    - **Solana Validator (Solana CLI 1.18.0)**:
      - **Description**: Processes Solana transactions (~35,000 tx/h, port 8899). Added WebSocket event subscription for real-time notifications.
      - **Context**: Uses Rust/Anchor for smart contracts. Integrates with Backend (via @solana/web3.js) and RabbitMQ (buy_queue, transaction_notifications). Subscribes to Solana events (e.g., `programSubscribe`) to publish transaction confirmations to RabbitMQ. Logs to Loki via Promtail.
      - **Example**: Publishes transaction confirmation to `transaction_notifications` queue, consumed by Fastify WebSocket.
      - **Configuration Details**:
        - Arquivo: `/solana/config/validator.yml`.
        - Porta: `8899`.
        - Variáveis: `SOLANA_KEYPAIR` (Vault).
        - Limite: 4 GB RAM, 100 GB storage.
      - **Dependencies**:
        - Serviços: Redis (TCP 6379), Rust, Anchor, RabbitMQ (TCP 5672).
        - Ordem: 1. Redis, 2. Rust/Anchor, 3. RabbitMQ, 4. Solana Validator.
      - **Security Settings**:
        - Segredo: `secret/solana_keypair` in Vault.
        - Firewall: `ufw allow 8899/tcp`.
        - Permissões: `chown solana:solana /solana -R; chmod 600 /solana/config/validator.yml`.
      - **Monitoring Rules**:
        - Métrica: `solana_block_time_ms`, `solana_websocket_events_total`.
        - Alerta: `alert: SolanaSlowBlocks expr: solana_block_time_ms > 400 for: 5m labels: { severity: "critical" }`, `alert: SolanaWebSocketFailure expr: rate(solana_websocket_events_total[5m]) == 0 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `avg(solana_block_time_ms)`, `sum(rate(solana_websocket_events_total[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/solana_ledger`).
        - Logrotate: `/var/log/solana.log` (daily, 7 days retention).
        - Atualização: `solana-install update` monthly.
        - Snapshot: Daily at 00:00 UTC.
      - **Rollback Strategy**:
        - Rollback: `solana-validator --reset` with previous snapshot.
        - Condição: Block validation failure or WebSocket event subscription failure.
        - Fallback: Last snapshot.

## 5. Monitoring (1 account: EU-MON-01)

- **Subnet**: 10.0.5.0/24 (private)
- **VMs**:
  - **A1.Flex**:
    - **Prometheus (2.54.0)**:
      - **Description**: Collects metrics (~10,000 metrics/s, port 9090), including WebSocket-specific metrics.
      - **Context**: Collects metrics from Fastify (APIs and WebSocket), Redis, Solana, Vault, etc. Added WebSocket metrics like `websocket_connections_active`, `websocket_message_duration_ms`. Integrates with Grafana for visualization.
      - **Example**: Metric `websocket_connections_active{job="fastify"}` tracks ~1000 concurrent WebSocket connections.
      - **Configuration Details**:
        - Arquivo: `/etc/prometheus/prometheus.yml`.
        - Porta: `9090`.
        - Variáveis: `SCRAPE_INTERVAL=15s`, `RETENTION=15d`.
        - Limite: 2 GB RAM, 10 GB storage.
        - Configuração WebSocket:
          ```yaml
          - job_name: 'fastify_websocket'
            static_configs:
              - targets: ['backend:3001']
          - job_name: 'react_websocket'
            static_configs:
              - targets: ['frontend:80']
          ```
      - **Dependencies**:
        - Serviços: Nenhum.
        - Ordem: 1. Prometheus.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 9090/tcp`.
        - Permissões: `chown prometheus:prometheus /etc/prometheus -R; chmod 644 /etc/prometheus/prometheus.yml`.
      - **Monitoring Rules**:
        - Métrica: `prometheus_scrape_duration_seconds`, `websocket_connections_active`.
        - Alerta: `alert: PrometheusScrapeFailure expr: rate(prometheus_scrape_duration_seconds[5m]) > 10 for: 5m labels: { severity: "critical" }`, `alert: WebSocketOverload expr: websocket_connections_active > 1000 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(rate(prometheus_scrape_duration_seconds[5m]))`, `sum(websocket_connections_active)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily at 01:00 UTC (`/backups/prometheus_data`).
        - Logrotate: `/var/log/prometheus.log` (daily, 7 days retention).
        - Auto-scaling: Add A1.Flex if CPU >80% for 5min.
        - Atualização: `apt upgrade prometheus` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install prometheus=2.53.0`.
        - Condição: Metric collection failure (HTTP 500 in /metrics).
        - Fallback: Prometheus v2.53.0.
    - **Grafana (11.2.0)**:
      - **Description**: Dashboards for metrics, logs, traces (port 3000), including WebSocket dashboards.
      - **Context**: Visualizes Prometheus, Loki, Jaeger data. Added WebSocket dashboard for connections, message latency, and errors. Integrates with Wazuh for security dashboards.
      - **Example**: Dashboard shows ~1000 active WebSocket connections and transaction notification latency.
      - **Configuration Details**:
        - Arquivo: `/etc/grafana/grafana.ini`.
        - Porta: `3000`.
        - Variáveis: `GF_AUTH_ANONYMOUS_ENABLED=false`, `GF_SERVER_ROOT_URL=http://grafana:3000`.
        - Limite: 1 GB RAM.
      - **Dependencies**:
        - Serviços: Prometheus (TCP 9090), Loki (TCP 3100), Jaeger (TCP 16686).
        - Ordem: 1. Prometheus, 2. Loki, 3. Jaeger, 4. Grafana.
      - **Security Settings**:
        - Segredo: `secret/grafana_admin_password` in Vault.
        - Firewall: `ufw allow 3000/tcp`.
        - Permissões: `chown grafana:grafana /etc/grafana -R; chmod 640 /etc/grafana/grafana.ini`.
      - **Monitoring Rules**:
        - Métrica: `grafana_dashboard_load_duration_ms`.
        - Alerta: `alert: GrafanaSlowDashboard expr: grafana_dashboard_load_duration_ms > 500 for: 5m labels: { severity: "warning" }`.
        - Dashboard: Grafana query `avg(grafana_dashboard_load_duration_ms)`, `sum(rate(websocket_messages_received_total{job="react"}[5m])) by (endpoint)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily at 02:00 UTC (`/backups/grafana_dashboards`, include WebSocket dashboard).
        - Logrotate: `/var/log/grafana.log` (daily, 7 days retention).
        - Atualização: `apt upgrade grafana` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install grafana=11.1.0`.
        - Condição: Dashboard loading failure (HTTP 502).
        - Fallback: Grafana v11.1.0.
    - **Jaeger (1.60.0)**:
      - **Description**: Visualizes distributed traces (~1000 traces/min), including WebSocket traces.
      - **Context**: Used with OpenTelemetry to debug latency (e.g., Frontend → Backend → Solana via WebSocket). Added tracing for WebSocket messages.
      - **Example**: Trace identifies 15ms latency in `/ws/transactions` message delivery.
      - **Configuration Details**:
        - Arquivo: `/etc/jaeger/config.yaml`.
        - Porta: `16686` (UI), `4317` (collector).
        - Variáveis: `SPAN_STORAGE_TYPE=badger`.
        - Limite: 1 GB RAM.
      - **Dependencies**:
        - Serviços: OpenTelemetry (TCP 4317).
        - Ordem: 1. OpenTelemetry, 2. Jaeger.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 16686/tcp`, `ufw allow 4317/tcp`.
        - Permissões: `chown jaeger:jaeger /etc/jaeger -R; chmod 644 /etc/jaeger/config.yaml`.
      - **Monitoring Rules**:
        - Métrica: `jaeger_traces_processed_total`, `websocket_trace_duration_ms`.
        - Alerta: `alert: JaegerTraceFailure expr: rate(jaeger_traces_processed_total[5m]) == 0 for: 5m labels: { severity: "critical" }`, `alert: WebSocketTraceSlow expr: websocket_trace_duration_ms > 100 for: 5m labels: { severity: "warning" }`.
        - Dashboard: Grafana query `sum(rate(jaeger_traces_processed_total[5m]))`, `avg(websocket_trace_duration_ms)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily at 03:00 UTC (`/backups/jaeger_data`).
        - Logrotate: `/var/log/jaeger.log` (daily, 7 days retention).
        - Atualização: `apt upgrade jaeger` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install jaeger=1.59.0`.
        - Condição: Trace collection failure.
        - Fallback: Jaeger v1.59.0.

## 4. Security (1 account: EU-SEC-01)

- **Subnet**: 10.0.4.0/24 (private)
- **VMs**:
  - **A1.Flex**:
    - **Vault (1.17.0)**:
      - **Description**: Manages keys/secrets (Solana keys, ADB passwords, WebSocket tokens, port 8200, AES-256, mTLS).
      - **Context**: Used by Fastify (APIs and WebSocket), Solana Validator, Oracle ADB. Added storage for WebSocket authentication tokens. Backups in MinIO, monitored by Wazuh.
      - **Example**: Fastify retrieves WebSocket token from Vault for client authentication.
      - **Configuration Details**:
        - Arquivo: `/etc/vault/vault.hcl`.
        - Porta: `8200`.
        - Variáveis: `VAULT_ADDR=http://vault:8200`.
        - Limite: 1 GB RAM, 5 GB storage.
      - **Dependencies**:
        - Serviços: MinIO (TCP 9000).
        - Ordem: 1. MinIO, 2. Vault.
      - **Security Settings**:
        - Segredo: `secret/vault_root_token` (manual initialization), `secret/fastify/websocket_token`.
        - Firewall: `ufw allow 8200/tcp`.
        - Permissões: `chown vault:vault /etc/vault -R; chmod 600 /etc/vault/vault.hcl`.
      - **Monitoring Rules**:
        - Métrica: `vault_core_unsealed`.
        - Alerta: `alert: VaultSealed expr: vault_core_unsealed == 0 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `vault_core_unsealed`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/vault_data`).
        - Logrotate: `/var/log/vault.log` (daily, 7 days retention).
        - Atualização: `apt upgrade vault` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install vault=1.16.0`.
        - Condição: Secret access failure.
        - Fallback: Vault v1.16.0.
    - **ModSecurity (3.0.12)**:
      - **Description**: WAF for API and WebSocket protection (~500 req/s, OWASP rules).
      - **Context**: Filters malicious requests (e.g., SQL injection) and WebSocket abuse (e.g., excessive messages). Logs to Loki via Promtail, monitored by Wazuh.
      - **Example**: Blocks client sending >100 WebSocket messages/s, logs event to Loki.
      - **Configuration Details**:
        - Arquivo: `/etc/modsecurity/modsecurity.conf`, `/etc/nginx/modsecurity/owasp.rules`.
        - Porta: Integrated with Nginx (80, 3001).
        - Variáveis: `SecRuleEngine On`, `SecWebSocketRateLimit 100/s`.
        - Limite: 200 MB RAM.
      - **Dependencies**:
        - Serviços: Nginx.
        - Ordem: 1. Nginx, 2. ModSecurity.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: Included in Nginx.
        - Permissões: `chown nginx:nginx /etc/modsecurity -R; chmod 644 /etc/modsecurity/*.conf`.
      - **Monitoring Rules**:
        - Métrica: `modsecurity_blocked_requests_total`, `modsecurity_websocket_blocked_total`.
        - Alerta: `alert: HighModSecurityBlocks expr: rate(modsecurity_blocked_requests_total[5m]) > 10 for: 5m labels: { severity: "critical" }`, `alert: WebSocketAttack expr: rate(modsecurity_websocket_blocked_total[5m]) > 5 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(rate(modsecurity_blocked_requests_total[5m]))`, `sum(rate(modsecurity_websocket_blocked_total[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/modsecurity_rules`).
        - Logrotate: `/var/log/modsecurity/audit.log` (daily, 7 days retention).
        - Atualização: OWASP rules updated monthly.
      - **Rollback Strategy**:
        - Rollback: Revert OWASP rules to previous version.
        - Condição: False positives block >5% requests or WebSocket messages.
        - Fallback: OWASP rules v3.0.11.
    - **Crowdsec (1.5.0)**:
      - **Description**: Crowd-sourced firewall, bans malicious IPs (~100 bans/day).
      - **Context**: Monitors Fastify logs (APIs and WebSocket), bans IPs via UFW after 5 invalid attempts. Added WebSocket abuse detection (e.g., repeated invalid connections).
      - **Example**: Bans IP sending invalid WebSocket handshakes to `/ws/transactions`.
      - **Configuration Details**:
        - Arquivo: `/etc/crowdsec/config.yaml`.
        - Porta: `8080`.
        - Variáveis: `CROWDSEC_API_KEY` (Vault).
        - Limite: 500 MB RAM.
      - **Dependencies**:
        - Serviços: Wazuh (TCP 1514), Fastify (TCP 3000, 3001).
        - Ordem: 1. Wazuh, 2. Fastify, 3. Crowdsec.
      - **Security Settings**:
        - Segredo: `secret/crowdsec_api_key` in Vault.
        - Firewall: `ufw allow 8080/tcp`.
        - Permissões: `chown crowdsec:crowdsec /etc/crowdsec -R; chmod 600 /etc/crowdsec/config.yaml`.
      - **Monitoring Rules**:
        - Métrica: `crowdsec_banned_ips_total`, `crowdsec_websocket_banned_ips_total`.
        - Alerta: `alert: CrowdsecHighBans expr: rate(crowdsec_banned_ips_total[5m]) > 10 for: 5m labels: { severity: "warning" }`, `alert: WebSocketBanSpike expr: rate(crowdsec_websocket_banned_ips_total[5m]) > 10 for: 5m labels: { severity: "warning" }`.
        - Dashboard: Grafana query `sum(rate(crowdsec_banned_ips_total[5m]))`, `sum(rate(crowdsec_websocket_banned_ips_total[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/crowdsec_config`).
        - Logrotate: `/var/log/crowdsec.log` (daily, 7 days retention).
        - Atualização: `apt upgrade crowdsec` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install crowdsec=1.4.0`.
        - Condição: False positives block legitimate IPs.
        - Fallback: Crowdsec v1.4.0.

## 6. Management (1 account: EU-MGMT-01)

- **Subnet**: 10.0.6.0/24 (private)
- **VMs**:
  - **A1.Flex**:
    - **Ansible (2.17.0)**:
      - **Description**: Infrastructure orchestration (~45 VMs, port 22), including WebSocket deployment.
      - **Context**: Manages deploy of Fastify (APIs and WebSocket), Solana, Vault, backups in MinIO. Added playbook for WebSocket configuration.
      - **Example**: Playbook `deploy_websocket.yml` configures Fastify WebSocket and Nginx in EU-BE-01.
      - **Configuration Details**:
        - Arquivo: `/etc/ansible/ansible.cfg`, `/ansible/playbooks/deploy_websocket.yml`.
        - Porta: `22` (SSH).
        - Variáveis: `ANSIBLE_VAULT_PASSWORD` (Vault).
        - Limite: 1 GB RAM.
      - **Dependencies**:
        - Serviços: Vault (TCP 8200).
        - Ordem: 1. Vault, 2. Ansible.
      - **Security Settings**:
        - Segredo: `secret/ansible_vault_password` in Vault.
        - Firewall: `ufw allow 22/tcp`.
        - Permissões: `chown ansible:ansible /etc/ansible -R; chmod 600 /etc/ansible/ansible.cfg`.
      - **Monitoring Rules**:
        - Métrica: `ansible_playbook_duration_seconds`.
        - Alerta: `alert: AnsiblePlaybookFailure expr: ansible_playbook_duration_seconds > 300 for: 1m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(ansible_playbook_duration_seconds) by (playbook)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/ansible_playbooks`, include `deploy_websocket.yml`).
        - Logrotate: `/var/log/ansible.log` (daily, 7 days retention).
        - Atualização: `pip install ansible==2.17.0` monthly.
      - **Rollback Strategy**:
        - Rollback: `pip install ansible==2.16.0`.
        - Condição: Playbook execution failure.
        - Fallback: Ansible v2.16.0.
    - **ArgoCD (2.12.0)**:
      - **Description**: CI/CD for applications (~10 deploys/day), including WebSocket services.
      - **Context**: Manages deploys of React, Fastify (APIs and WebSocket), Solana. Added application `fastify-websocket`. Integrates with GitHub and Vault.
      - **Example**: Deploy of Fastify WebSocket to EU-BE-01 via `argocd app sync fastify-websocket`.
      - **Configuration Details**:
        - Arquivo: `/etc/argocd/argocd-cm.yaml`.
        - Porta: `8080`.
        - Variáveis: `ARGOCD_SERVER=argocd:8080`.
        - Limite: 1 GB RAM.
      - **Dependencies**:
        - Serviços: Vault (TCP 8200).
        - Ordem: 1. Vault, 2. ArgoCD.
      - **Security Settings**:
        - Segredo: `secret/argocd_admin_password` in Vault.
        - Firewall: `ufw allow 8080/tcp`.
        - Permissões: `chown argocd:argocd /etc/argocd -R; chmod 644 /etc/argocd/argocd-cm.yaml`.
      - **Monitoring Rules**:
        - Métrica: `argocd_app_sync_duration_seconds`.
        - Alerta: `alert: ArgoCDDeployFailure expr: argocd_app_sync_duration_seconds > 300 for: 1m labels: { severity: "critical" }`, `alert: WebSocketDeployFailure expr: argocd_app_sync_duration_seconds{app="fastify-websocket"} > 300 for: 1m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(argocd_app_sync_duration_seconds) by (app)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/argocd_config`).
        - Logrotate: `/var/log/argocd.log` (daily, 7 days retention).
        - Atualização: `apt upgrade argocd` monthly.
      - **Rollback Strategy**:
        - Rollback: `argocd app rollback fastify-websocket --to-version <previous>`.
        - Condição: Deploy failure (status Degraded).
        - Fallback: ArgoCD v2.11.0.

## 8. Logs (1 account: EU-LOG-01)

- **Subnet**: 10.0.8.0/24 (private)
- **VMs**:
  - **A1.Flex**:
    - **Loki (2.9.0)**:
      - **Description**: Stores logs (~100,000 logs/s, port 3100), including WebSocket logs.
      - **Context**: Receives logs from Promtail (Frontend, Backend, Solana, WebSocket). Integrates with Grafana for visualization.
      - **Example**: WebSocket error log `{ "level": "error", "msg": "Connection failed", "client_ip": "1.2.3.4" }` visualized in Grafana.
      - **Configuration Details**:
        - Arquivo: `/etc/loki/config.yml`.
        - Porta: `3100`.
        - Variáveis: `LOKI_STORAGE=filesystem`, `RETENTION=30d`.
        - Limite: 2 GB RAM, 20 GB storage.
      - **Dependencies**:
        - Serviços: Nenhum.
        - Ordem: 1. Loki.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 3100/tcp`.
        - Permissões: `chown loki:loki /etc/loki -R; chmod 644 /etc/loki/config.yml`.
      - **Monitoring Rules**:
        - Métrica: `loki_logs_stored_total`.
        - Alerta: `alert: LokiStorageFull expr: loki_storage_used_bytes > 18e9 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(loki_logs_stored_total)`, `sum(rate(loki_logs_stored_total{job="fastify_websocket"}[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/loki_data`).
        - Logrotate: `/var/log/loki.log` (daily, 7 days retention).
        - Atualização: `apt upgrade loki` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install loki=2.8.0`.
        - Condição: Log storage failure.
        - Fallback: Loki v2.8.0.
    - **Fluentd (1.17.0)**:
      - **Description**: Aggregates logs from Promtail (~100,000 logs/s, port 24224), including WebSocket logs.
      - **Context**: Consolidates logs before sending to Loki. Added filtering for WebSocket logs (tag: `websocket`). Integrates with Wazuh for analysis.
      - **Example**: Aggregates WebSocket logs from Fastify, sends to Loki.
      - **Configuration Details**:
        - Arquivo: `/etc/fluentd/fluent.conf`.
        - Porta: `24224`.
        - Variáveis: `FLUENTD_LOKI_URL=http://loki:3100`.
        - Limite: 1 GB RAM.
        - Configuração WebSocket:
          ```conf
          <match websocket.**>
            @type loki
            url http://loki:3100
            label_keys job,host
          </match>
          ```
      - **Dependencies**:
        - Serviços: Loki (TCP 3100).
        - Ordem: 1. Loki, 2. Fluentd.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 24224/tcp`.
        - Permissões: `chown fluentd:fluentd /etc/fluentd -R; chmod 644 /etc/fluentd/fluent.conf`.
      - **Monitoring Rules**:
        - Métrica: `fluentd_logs_processed_total`.
        - Alerta: `alert: FluentdFailure expr: rate(fluentd_logs_processed_total[5m]) == 0 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `sum(rate(fluentd_logs_processed_total[5m]))`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/fluentd_config`).
        - Logrotate: `/var/log/fluentd.log` (daily, 7 days retention).
        - Atualização: `apt upgrade fluentd` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install fluentd=1.16.0`.
        - Condição: Log processing failure.
        - Fallback: Fluentd v1.16.0.

## 9. Network Management (1 account: EU-NET-01)

- **Subnet**: 10.0.9.0/24 (private)
- **VMs**:
  - **A1.Flex**:
    - **HAProxy (2.8.0)**:
      - **Description**: Internal load balancing (~50,000 req/s, port 80, 3001 for WebSocket).
      - **Context**: Manages internal traffic (Frontend → Backend APIs, Backend → Solana, WebSocket connections). Added TCP mode for WebSocket on port 3001. Monitored by Prometheus.
      - **Example**: Routes WebSocket connections to `/ws/transactions` to Backend (EU-BE-01).
      - **Configuration Details**:
        - Arquivo: `/etc/haproxy/haproxy.cfg`.
        - Porta: `80`, `443` (HTTP), `3001` (WebSocket).
        - Variáveis: `MAXCONN=50000`.
        - Limite: 1 GB RAM.
        - Configuração WebSocket:
          ```haproxy
          frontend ws_frontend
              bind *:3001
              mode tcp
              option tcplog
              default_backend ws_backend
          backend ws_backend
              mode tcp
              option httpchk GET /ws/health
              server backend1 backend:3001 check
          ```
      - **Dependencies**:
        - Serviços: Nenhum.
        - Ordem: 1. HAProxy.
      - **Security Settings**:
        - Segredo: Nenhum.
        - Firewall: `ufw allow 80/tcp`, `ufw allow 443/tcp`, `ufw allow 3001/tcp`.
        - Permissões: `chown haproxy:haproxy /etc/haproxy -R; chmod 644 /etc/haproxy/haproxy.cfg`.
      - **Monitoring Rules**:
        - Métrica: `haproxy_backend_response_time_ms`, `haproxy_websocket_connections_active`.
        - Alerta: `alert: HAProxyHighLatency expr: haproxy_backend_response_time_ms > 50 for: 5m labels: { severity: "critical" }`, `alert: HAProxyWebSocketFailure expr: haproxy_websocket_connections_active == 0 for: 5m labels: { severity: "critical" }`.
        - Dashboard: Grafana query `avg(haproxy_backend_response_time_ms) by (backend)`, `sum(haproxy_websocket_connections_active)`.
      - **Maintenance Tasks**:
        - Backup: MinIO daily (`/backups/haproxy_config`).
        - Logrotate: `/var/log/haproxy.log` (daily, 7 days retention).
        - Auto-scaling: Add A1.Flex if connections >45000.
        - Atualização: `apt upgrade haproxy` monthly.
      - **Rollback Strategy**:
        - Rollback: `apt install haproxy=2.7.0`.
        - Condição: Load balancing failure (HTTP 503 or WebSocket disconnection).
        - Fallback: HAProxy v2.7.0.
