# Cloudflare Setup for BlitzHub

## Overview
Cloudflare is a critical component of BlitzHub's infrastructure, providing CDN (Content Delivery Network), WAF (Web Application Firewall), GeoDNS, Rate Limiting, and DDoS protection. It serves as the entry point for user traffic, caching static assets, protecting against attacks, and optimizing performance across regions. This document details the manual setup and configuration of Cloudflare for BlitzHub, including DNS, CDN, WAF, load balancing, performance optimizations, and integration with other components.

## Prerequisites
Before configuring Cloudflare, ensure the following:
- Domain `blitzhub.xyz` is registered and its nameservers are pointed to Cloudflare (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`).
- Access to Cloudflare dashboard with an account associated with `contact@klytic.com`.
- API key for Cloudflare automation (available in Cloudflare dashboard under "My Profile" > "API Tokens").
- IPs of Frontend servers (e.g., EU-FE-01 A1.Flex VM) and Backend servers (e.g., EU-BE-01, NA-BE-01) are available (refer to `infra/docs/vm_inventory.md`).
- Monitoring infrastructure (Prometheus, Grafana, Loki) is set up on EU-MON-01 for Cloudflare metrics and logs.

## Configuration Steps

### 1. DNS Setup
Cloudflare manages DNS for `blitzhub.xyz`, ensuring fast resolution, security, and geo-aware routing.

- **DNSSEC**:
  - Enable DNSSEC in Cloudflare dashboard to secure DNS queries.
  - Frequency: Rotate keys quarterly.
  - Steps:
    1. Go to DNS > Settings > DNSSEC.
    2. Enable DNSSEC and note the DS record.
    3. Add the DS record to your domain registrar.
    4. Verify with: `dig +dnssec blitzhub.xyz`.
- **Records**:
  - **A Records**:
    - `eu-fe.blitzhub.xyz` → IP of EU-FE-01 A1.Flex VM (e.g., `141.123.45.67`).
    - `na-fe.blitzhub.xyz` → IP of NA-FE-01 A1.Flex VM (e.g., `132.234.56.78`).
    - `eu-be.blitzhub.xyz` → IP of EU-BE-01 A1.Flex VM (e.g., `141.123.45.68`).
    - `na-be.blitzhub.xyz` → IP of NA-BE-01 A1.Flex VM (e.g., `132.234.56.79`).
    - Similar records for SA-FE-01, AF-FE-01, AS-FE-01, AU-FE-01, and ME-FE-01.
    - Example in Cloudflare dashboard:
      - Type: A
      - Name: `eu-fe`
      - IPv4 Address: `141.123.45.67`
      - Proxy Status: Proxied
      - TTL: 300 seconds
  - **CNAME Records**:
    - `api.blitzhub.xyz` → `eu-be.blitzhub.xyz` (Backend entry point, will be updated by Load Balancer).
    - `ws.blitzhub.xyz` → `eu-be.blitzhub.xyz` (WebSocket endpoint, will be updated by Load Balancer).
    - Example in Cloudflare dashboard:
      - Type: CNAME
      - Name: `api`
      - Target: `eu-be.blitzhub.xyz`
      - Proxy Status: Proxied
      - TTL: 300 seconds
  - **TXT Records**:
    - SPF: `v=spf1 include:_spf.google.com ~all` (for email).
    - DKIM: `v=DKIM1; k=rsa; p=<public_key>` (for email signing, replace `<public_key>` with your DKIM key).
    - Example in Cloudflare dashboard:
      - Type: TXT
      - Name: `blitzhub.xyz`
      - Value: `v=spf1 include:_spf.google.com ~all`
      - Proxy Status: DNS Only
      - TTL: 300 seconds
- **GeoDNS**:
  - Cloudflare automatically routes users to the nearest server based on their location (e.g., EU users to `eu-be.blitzhub.xyz` for backend traffic).
  - No additional configuration required; GeoDNS is enabled by default when records are Proxied.
- **CNAME Flattening**:
  - Enable CNAME flattening for the apex domain (`blitzhub.xyz`) to allow CNAME usage at the root.
  - Steps:
    1. Go to DNS > Settings > CNAME Flattening.
    2. Select "Flatten CNAME at apex".

### 2. CDN Configuration
Cloudflare's CDN reduces latency by caching content at ~300 Points of Presence (PoPs) worldwide.

- **Caching Rules**:
  - **Static Assets**:
    - Path: `/static/*` (e.g., JS, CSS, images).
    - Cache Level: `Standard`.
    - Edge Cache TTL: 604800 seconds (7 days).
    - Browser Cache TTL: `max-age=604800`.
    - Compression: Brotli enabled (~20% bandwidth reduction).
    - Steps in Cloudflare dashboard:
      1. Go to Caching > Configuration.
      2. Set Browser Cache TTL to 604800 seconds.
      3. Create a Page Rule:
         - URL Pattern: `blitzhub.xyz/static/*`
         - Setting: Cache Level → Standard
         - Setting: Edge Cache TTL → 604800 seconds
         - Setting: Enable Brotli
  - **API Responses**:
    - Path: `/api/tokens`, `/api/token/{mint}`.
    - Cache Level: `Cache Everything`.
    - Edge Cache TTL: 10 seconds.
    - Headers: `ETag` for cache validation.
    - Steps in Cloudflare dashboard:
      1. Create a Page Rule:
         - URL Pattern: `blitzhub.xyz/api/tokens*`
         - Setting: Cache Level → Cache Everything
         - Setting: Edge Cache TTL → 10 seconds
      2. Create another Page Rule:
         - URL Pattern: `blitzhub.xyz/api/token/*`
         - Setting: Cache Level → Cache Everything
         - Setting: Edge Cache TTL → 10 seconds
- **Cache Purge**:
  - Purge cache manually when assets or API responses need refreshing (e.g., new React build).
  - Example API call to purge `/static/app.js`:
    ```bash
    curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
    -H "X-Auth-Email: contact@klytic.com" \
    -H "X-Auth-Key: {api_key}" \
    -H "Content-Type: application/json" \
    -d '{"files":["https://blitzhub.xyz/static/app.js"]}'
    ```
  - Steps in Cloudflare dashboard:
    1. Go to Caching > Purge Cache.
    2. Select "Purge by URL".
    3. Enter `https://blitzhub.xyz/static/app.js`.
    4. Click "Purge".
- **Smart Tiered Cache**:
  - Enable to reduce origin requests by caching at higher-tier PoPs.
  - Steps in Cloudflare dashboard:
    1. Go to Caching > Tiered Cache.
    2. Enable Smart Tiered Cache Topology.

### 3. Web Application Firewall (WAF) and Security
Cloudflare's WAF protects against common threats and ensures secure traffic to BlitzHub.

- **Managed Rules**:
  - OWASP Core Ruleset: Enabled to block SQLi, XSS, and other common attacks.
  - Cloudflare Managed Rules: Enabled (`cf.threat_score > 50` blocks suspicious traffic).
  - Steps in Cloudflare dashboard:
    1. Go to Security > WAF > Managed Rules.
    2. Enable OWASP Core Ruleset.
    3. Enable Cloudflare Managed Rules with threshold `cf.threat_score > 50`.
- **Custom Rules**:
  - **Protect Sensitive Endpoints**:
    - Rule: Block requests to `/admin/*` and `/api/buy` with `cf.threat_score > 30`.
    - Action: `Block`.
    - Steps in Cloudflare dashboard:
      1. Go to Security > WAF > Custom Rules.
      2. Create Rule:
         - Name: `ProtectAdminAndBuy`
         - Expression: `(http.request.uri.path matches "^/admin/.*$") or (http.request.uri.path matches "^/api/buy$") and cf.threat_score > 30`
         - Action: Block
  - **SQL Injection Protection**:
    - Rule: `http.request.uri.query contains "SELECT" or "UNION"`.
    - Action: `Block`.
    - Steps in Cloudflare dashboard:
      1. Create Rule:
         - Name: `BlockSQLi`
         - Expression: `http.request.uri.query contains "SELECT" or http.request.uri.query contains "UNION"`
         - Action: Block
  - **XSS Protection**:
    - Rule: `http.request.uri.query contains "<script>"`.
    - Action: `Block`.
    - Steps in Cloudflare dashboard:
      1. Create Rule:
         - Name: `BlockXSS`
         - Expression: `http.request.uri.query contains "<script>"`
         - Action: Block
- **Rate Limiting**:
  - **/api/buy**: 50 requests/10 seconds per IP.
    - Configuration: `requests: 50, period: 10s, action: block`.
    - Steps in Cloudflare dashboard:
      1. Go to Security > WAF > Rate Limiting Rules.
      2. Create Rule:
         - Name: `RateLimitBuy`
         - URL Pattern: `*/api/buy`
         - Method: POST
         - Threshold: 50 requests
         - Period: 10 seconds
         - Action: Block
  - **/api/tokens**: 100 requests/10 seconds per IP.
    - Configuration: `requests: 100, period: 10s, action: block`.
    - Steps in Cloudflare dashboard:
      1. Create Rule:
         - Name: `RateLimitTokens`
         - URL Pattern: `*/api/tokens`
         - Method: GET
         - Threshold: 100 requests
         - Period: 10 seconds
         - Action: Block
  - Example API call to set rate limiting for `/api/buy`:
    ```bash
    curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/rate_limits" \
    -H "X-Auth-Email: contact@klytic.com" \
    -H "X-Auth-Key: {api_key}" \
    -H "Content-Type: application/json" \
    -d '{"match":{"request":{"url_pattern":"*/api/buy","methods":["POST"]}},"threshold":50,"period":10,"action":{"mode":"block"}}}'
    ```
- **DDoS Protection**:
  - **L3/L7 Mitigation**: Automatically mitigates volumetric (>1M req/s) and application-layer attacks.
  - **Under Attack Mode**: Manually enable during high-traffic events (e.g., token launch).
    - Steps in Cloudflare dashboard:
      1. Go to Security > Overview.
      2. Toggle "Under Attack Mode" to ON.
    - Example API call to enable:
      ```bash
      curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/security_level" \
      -H "X-Auth-Email: contact@klytic.com" \
      -H "X-Auth-Key: {api_key}" \
      -H "Content-Type: application/json" \
      -d '{"value":"under_attack"}'
      ```
- **SSL/TLS**:
  - **Encryption Mode**: `Full (Strict)` to ensure end-to-end encryption.
  - **TLS Version**: Minimum TLS 1.2, recommended TLS 1.3.
  - **HSTS**: Enabled with `max-age=31536000` (1 year) and `includeSubDomains`.
  - **Certificate**: Cloudflare-managed Universal SSL certificate for `blitzhub.xyz` and subdomains.
  - Steps in Cloudflare dashboard:
    1. Go to SSL/TLS > Overview.
    2. Set Encryption Mode to "Full (Strict)".
    3. Go to SSL/TLS > Edge Certificates.
    4. Enable HSTS with `max-age=31536000` and `includeSubDomains`.
    5. Set Minimum TLS Version to 1.2.
- **Zero Trust**:
  - **Admin Access**: Restrict `/admin` and `/metrics` endpoints to specific IPs with 2FA.
  - Steps in Cloudflare dashboard:
    1. Go to Zero Trust > Access > Applications.
    2. Add Application:
       - Name: `BlitzHubAdmin`
       - Domain: `blitzhub.xyz/admin/*`, `blitzhub.xyz/metrics/*`
       - Policy: Allow users with email domain `klytic.com` and require 2FA.

### 4. Load Balancing and Failover
Cloudflare's Load Balancer ensures high availability and optimal traffic distribution for both frontend and backend servers.

- **Load Balancer Pools**:
  - **Frontend Pool**:
    - Members: EU-FE-01, NA-FE-01, SA-FE-01, AF-FE-01, AS-FE-01, AU-FE-01, ME-FE-01.
    - Health Check: `/health` (HTTP, interval 10s, timeout 5s).
    - Weights: 60% to A1.Flex, 20% to each E2.1.Micro VM.
    - Steps in Cloudflare dashboard:
      1. Go to Traffic > Load Balancing.
      2. Create Pool:
         - Name: `FrontendPool`
         - Origins: Add IPs of EU-FE-01, NA-FE-01, etc. (refer to `vm_inventory.md`).
         - Weights: 60% for A1.Flex, 20% for each E2.1.Micro.
      3. Create Health Check:
         - Path: `/health`
         - Interval: 10 seconds
         - Timeout: 5 seconds
  - **Backend Pool**:
    - Members: EU-BE-01, NA-BE-01.
    - Health Check: `/health` (HTTP, interval 10s, timeout 5s).
    - Distribution: Dynamic based on region (Europe → EU-BE-01, North America → NA-BE-01, fallback 50/50).
    - Supports: 16,000 WebSocket connections (8,000 per backend).
    - Steps in Cloudflare dashboard:
      1. Go to Traffic > Load Balancing.
      2. Create Pool:
         - Name: `BackendPool`
         - Origins: Add IPs of EU-BE-01 (e.g., `141.123.45.68`), NA-BE-01 (e.g., `132.234.56.79`).
         - Weights: Equal (1:1) for fallback.
      3. Create Health Check:
         - Path: `/health`
         - Interval: 10 seconds
         - Timeout: 5 seconds
      4. Create Load Balancer:
         - Hostname: `api.blitzhub.xyz`
         - Pool: `BackendPool`
         - Steering Policy: Geo-Steering
         - Geo Rules:
           - Region: `Europe`, Pool: `EU-BE-01`, Priority: 1
           - Region: `North America`, Pool: `NA-BE-01`, Priority: 1
           - Region: `default`, Pool: `EU-BE-01` and `NA-BE-01`, Fallback: Round-robin (50/50)
  - **Failover**:
    - **Frontend**: If A1.Flex fails (e.g., EU-FE-01), traffic is rerouted to E2.1.Micro VMs (EU-FE-E2-01, EU-FE-E2-02).
    - **Backend**: If EU-BE-01 fails, traffic is rerouted to NA-BE-01, and vice versa.
- **Geo-Steering**:
  - Routes traffic to the nearest PoP (<30ms latency) using GeoDNS.
  - For Frontend: EU users to EU-FE-01, NA users to NA-FE-01, etc.
  - For Backend: EU users to EU-BE-01, NA users to NA-BE-01, with fallback to 50/50 distribution.
  - Steps in Cloudflare dashboard:
    1. Go to Traffic > Load Balancing.
    2. Edit Load Balancer for `blitzhub.xyz` (FrontendPool) and `api.blitzhub.xyz` (BackendPool).
    3. Enable Geo-Steering.
- **Session Affinity**:
  - Enable cookie-based sticky sessions for WebSocket connections (`/ws/*`).
  - Applies to both Frontend (`ws.blitzhub.xyz`) and Backend (`api.blitzhub.xyz`) WebSocket traffic.
  - Steps in Cloudflare dashboard:
    1. Go to Traffic > Load Balancing.
    2. Edit Load Balancer for `blitzhub.xyz` and `api.blitzhub.xyz`.
    3. Enable Session Affinity with `Cookie`.

### 5. Performance Optimizations
Cloudflare is configured to enhance performance for BlitzHub's global user base.

- **Brotli Compression**:
  - Enabled for all responses (~20% bandwidth reduction).
  - Steps in Cloudflare dashboard:
    1. Go to Speed > Optimization.
    2. Enable Brotli.
- **HTTP/3 and QUIC**:
  - Enabled to improve latency and reliability for modern browsers.
  - Steps in Cloudflare dashboard:
    1. Go to Network.
    2. Enable HTTP/3 (with QUIC).
- **Argo Smart Routing**:
  - Enabled to optimize traffic routing through Cloudflare's private network, reducing latency by ~15%.
  - Steps in Cloudflare dashboard:
    1. Go to Traffic > Argo.
    2. Enable Argo Smart Routing.
- **Mirage**:
  - Enabled to optimize image delivery based on user device (e.g., lower resolution for mobile).
  - Steps in Cloudflare dashboard:
    1. Go to Speed > Optimization.
    2. Enable Mirage.
- **Polish**:
  - Set to `lossless` for image optimization without quality degradation.
  - Steps in Cloudflare dashboard:
    1. Go to Speed > Optimization.
    2. Enable Polish.
    3. Set Polish to `Lossless`.
- **Rocket Loader**:
  - Disabled to ensure immediate JavaScript execution for React components.
  - Steps in Cloudflare dashboard:
    1. Go to Speed > Optimization.
    2. Disable Rocket Loader.
- **Cloudflare Fonts**:
  - Disabled, as BlitzHub uses custom fonts hosted in Object Storage (`AssetsBlitzHubXX`).
  - Steps in Cloudflare dashboard:
    1. Go to Speed > Optimization.
    2. Disable Cloudflare Fonts.

### 6. Integration with BlitzHub Infrastructure
Cloudflare integrates with various components of BlitzHub for performance, security, and monitoring.

- **Frontend Servers (EU-FE-01, NA-FE-01, etc.)**:
  - All traffic to Frontend servers is proxied through Cloudflare.
  - Headers forwarded: `X-Forwarded-For`, `X-Forwarded-Proto` for NGINX to handle redirects.
  - Cloudflare applies WAF rules and caching before forwarding requests.
- **Backend Servers (EU-BE-01, NA-BE-01)**:
  - API requests (e.g., `/api/buy`) and WebSocket traffic are routed through Cloudflare to Backend servers after WAF and rate limiting checks.
  - Responses are cached for 10 seconds to reduce Backend load.
  - Load balancing ensures traffic is distributed dynamically by region (EU → EU-BE-01, NA → NA-BE-01, fallback 50/50).
- **Solana Nodes (EU-SOL-01, AS-SOL-01)**:
  - Not directly exposed to Cloudflare; Backend servers handle secure communication with Solana nodes.
- **Security (EU-SEC-01)**:
  - Cloudflare logs (e.g., WAF blocks, rate limit events) are sent to Loki on EU-SEC-01 via Cloudflare Logpush.
  - Example Logpush setup:
    ```bash
    curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/logpush/jobs" \
    -H "X-Auth-Email: contact@klytic.com" \
    -H "X-Auth-Key: {api_key}" \
    -H "Content-Type: application/json" \
    -d '{"destination_conf":"http://eu-sec.blitzhub.xyz:3100/loki/api/v1/push","fields":"RayID,ClientIP,EdgeStartTimestamp,RequestURI,ResponseStatus","name":"blitzhub-waf-logs"}'
    ```
- **Monitoring (EU-MON-01)**:
  - Metrics exported to Prometheus:
    - `cf_requests_total`: Total requests processed by Cloudflare.
    - `cf_threats_blocked`: Number of threats blocked by WAF.
    - `cf_cache_hit_ratio`: Cache hit ratio for static assets and APIs.
  - Grafana Dashboard: "Cloudflare Performance" with panels for request rate, threat blocks, and cache hit ratio.
  - Example Prometheus scrape config:
    ```yaml
    - job_name: 'cloudflare'
      metrics_path: '/api/v4/zones/{zone_id}/analytics'
      bearer_token: '{api_key}'
      static_configs:
        - targets: ['api.cloudflare.com']
    ```
- **Object Storage**:
  - Static assets in `AssetsBlitzHubXX` buckets are served via Cloudflare's CDN with `max-age=604800`.

### 7. Monitoring and Alerts
Cloudflare metrics are integrated into BlitzHub's monitoring stack for observability.

- **Prometheus Metrics**:
  - `cf_requests_total`: Total requests processed.
  - `cf_threats_blocked`: Threats blocked by WAF or rate limiting.
  - `cf_cache_hit_ratio`: Cache hit ratio (target >80%).
  - `cf_latency_seconds`: Latency at Cloudflare edge (target <30ms p95).
- **Grafana Dashboards**:
  - **Dashboard**: "Cloudflare Performance".
  - Panels:
    - Request Rate (req/s) over time.
    - Threats Blocked (count) over time.
    - Cache Hit Ratio (%).
    - Edge Latency (ms, p95).
- **Alerts**:
  - `cf_threats_blocked > 100`: Alert if more than 100 threats are blocked in 5 minutes (possible attack).
  - `cf_cache_hit_ratio < 0.8`: Alert if cache hit ratio drops below 80% for 10 minutes.
  - `cf_latency_seconds > 0.03`: Alert if edge latency exceeds 30ms (p95) for 5 minutes.
  - Example Prometheus alert rule:
    ```yaml
    groups:
    - name: cloudflare_alerts
      rules:
      - alert: HighThreatsBlocked
        expr: cf_threats_blocked > 100
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High number of threats blocked by Cloudflare"
          description: "Cloudflare blocked {{ $value }} threats in the last 5 minutes."
    ```

### 8. Testing Cloudflare Configurations
After setup, verify Cloudflare configurations to ensure they work as expected.

- **DNS Resolution**:
  - Command: `dig eu-fe.blitzhub.xyz`.
  - Expected: Resolves to Cloudflare IPs (e.g., `104.21.0.0/16`).
- **Caching**:
  - Command: `curl -I https://blitzhub.xyz/static/app.js`.
  - Expected Header: `CF-Cache-Status: HIT`.
- **WAF**:
  - Simulate an XSS attack: `curl "https://blitzhub.xyz/api/buy?data=<script>alert(1)</script>"`.
  - Expected: HTTP 403 (blocked by WAF).
- **Rate Limiting**:
  - Simulate 60 requests to `/api/buy` in 10 seconds from a single IP.
  - Expected: After 50 requests, HTTP 429 (rate limit exceeded).
- **GeoDNS**:
  - **Frontend**:
    - From EU: `curl eu-fe.blitzhub.xyz/health` → Should route to EU-FE-01.
    - From NA: `curl na-fe.blitzhub.xyz/health` → Should route to NA-FE-01.
  - **Backend**:
    - From EU: `curl api.blitzhub.xyz/health` → Should route to EU-BE-01.
    - From NA: `curl api.blitzhub.xyz/health` → Should route to NA-BE-01.
    - From other regions (e.g., Asia): `curl api.blitzhub.xyz/health` → Should route to either EU-BE-01 or NA-BE-01 (50/50).
- **Failover**:
  - **Frontend**:
    - Simulate A1.Flex failure in EU-FE-01.
    - Command: `curl eu-fe.blitzhub.xyz/health`.
    - Expected: Traffic reroutes to E2.1.Micro VMs (EU-FE-E2-01 or EU-FE-E2-02).
  - **Backend**:
    - Simulate EU-BE-01 failure.
    - Command: `curl api.blitzhub.xyz/health`.
    - Expected: Traffic reroutes to NA-BE-01.

### 9. Troubleshooting
Common issues and their resolutions:

- **Challenge Loops**:
  - Issue: Users stuck in Cloudflare challenge loops (e.g., Under Attack Mode).
  - Resolution: Check for conflicting WAF rules; use Cloudflare Trace (`curl https://blitzhub.xyz/cdn-cgi/trace`) to debug.
- **Cache Misses**:
  - Issue: Low cache hit ratio (`cf_cache_hit_ratio < 0.8`).
  - Resolution: Verify caching rules; ensure `Cache Everything` is enabled for `/api/tokens`.
- **Rate Limiting False Positives**:
  - Issue: Legitimate users blocked by rate limiting.
  - Resolution: Increase threshold (e.g., to 75 req/10s) or whitelist IPs via Cloudflare dashboard.
- **DNS Propagation Delays**:
  - Issue: DNS updates not reflecting.
  - Resolution: Check TTL (should be 300s); use `dig +trace eu-fe.blitzhub.xyz` to debug.
- **Backend Load Balancing Issues**:
  - Issue: Traffic not distributing as expected (e.g., all traffic going to EU-BE-01).
  - Resolution: Verify Geo-Steering rules in the Load Balancer; ensure Health Checks are passing for both EU-BE-01 and NA-BE-01.

### 10. Maintenance and Updates
Regular maintenance ensures Cloudflare configurations remain effective.

- **WAF Rule Updates**:
  - Frequency: Weekly, using Cloudflare CLI (version 2.18.0).
  - Example: `cf-cli update-managed-rules --ruleset owasp`.
- **DNSSEC Key Rotation**:
  - Frequency: Quarterly.
  - Steps:
    1. Go to DNS > DNSSEC in Cloudflare dashboard.
    2. Generate new keys.
    3. Update DS record at registrar.
    4. Verify with `dig +dnssec blitzhub.xyz`.
- **Log Rotation**:
  - Logs sent to Loki (EU-SEC-01) have a 7-day retention policy.
  - Verify: `logcli query '{app="cloudflare"}' --limit=10`.

## References
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/)
- [Cloudflare API Documentation](https://api.cloudflare.com/)
- [Cloudflare Logpush Documentation](https://developers.cloudflare.com/logs/)
