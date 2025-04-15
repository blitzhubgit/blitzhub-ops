# Domain Setup for BlitzHub (.xyz)

## Overview
This document outlines the process of purchasing, configuring, and managing the top-level domain (TLD) `blitzhub.xyz` for the BlitzHub project. The `.xyz` TLD was chosen for its modern association with technology and Web3 projects, universal browser compatibility, and likely availability. The domain is registered with GoDaddy and uses Cloudflare for DNS management, CDN, WAF, and DDoS protection. This setup ensures that the domain serves as the primary entry point for the BlitzHub platform, integrated with Cloudflare for optimal performance and security (as detailed in `cloudflare_setup.md`).

## Prerequisites
- A domain (`blitzhub.xyz`) registered with GoDaddy.
- A Cloudflare account associated with `contact@klytic.com`.
- Access to the GoDaddy dashboard for DNS management.
- IPs of Frontend and Backend servers (refer to `vm_inventory.md`).

## Purchase Process

### Step 1: Choose a Registrar
- The domain `blitzhub.xyz` was purchased through GoDaddy, a widely used registrar.
- **Cost**: Approximately $10-$15 for the first year.

### Step 2: Confirm Purchase
- The domain is already registered under your GoDaddy account with the email `contact@klytic.com`.
- Ensure that auto-renewal is enabled to avoid losing the domain.

## Configuration

### Step 1: Add Domain to Cloudflare
- Log in to Cloudflare at [https://www.cloudflare.com/](https://www.cloudflare.com/) using `contact@klytic.com`.
- Click **"Add a Site"** or **"Add a Domain"**.
- Enter `blitzhub.xyz` and click **"Add Site"**.
- Choose the free plan (sufficient for BlitzHub's needs; upgrade to a paid plan for advanced features like Argo Smart Routing if needed).
- Cloudflare will scan for existing DNS records from GoDaddy. Review the records (if any) and click **"Continue"**.

### Step 2: Point Nameservers to Cloudflare
- Cloudflare will provide two nameservers for `blitzhub.xyz`, e.g.:
  - `denver.ns.cloudflare.com`
  - `leah.ns.cloudflare.com`
  - **Note**: Your actual nameservers will be different. Copy the nameservers provided by Cloudflare.
- Log in to your GoDaddy account at [https://www.godaddy.com/](https://www.godaddy.com/).
- Go to **"My Products"**, locate `blitzhub.xyz`, and click **"Manage DNS"** or **"DNS"**.
- Scroll to the **"Nameservers"** section and click **"Change"**.
- Select **"Enter my own nameservers (advanced)"**.
- Enter the Cloudflare nameservers (e.g., `denver.ns.cloudflare.com` and `leah.ns.cloudflare.com`).
- Click **"Save"** and confirm the changes.
- **Propagation Time**: This may take 24-48 hours, but typically completes within a few hours.
- Verify propagation:
  - Command: `dig ns blitzhub.xyz`
  - Expected: Returns Cloudflare nameservers (e.g., `denver.ns.cloudflare.com`, `leah.ns.cloudflare.com`).

### Step 3: Confirm Nameserver Update in Cloudflare
- Return to the Cloudflare dashboard and click **"Done, Check Nameservers"**.
- Cloudflare will verify the nameserver update.
- Once confirmed, you'll see: **"Great news! Cloudflare is now protecting your site."**
- You'll also receive a confirmation email from Cloudflare.

### Step 4: Configure DNS Records in Cloudflare
- In the Cloudflare dashboard, go to **DNS > Records**.
- Add the following records to point to BlitzHub's infrastructure:
  - **A Records** (Frontend servers):
    - `eu-fe.blitzhub.xyz` → `141.123.45.67` (IP of EU-FE-01).
    - `na-fe.blitzhub.xyz` → `132.234.56.78` (IP of NA-FE-01).
    - Similar records for SA-FE-01, AF-FE-01, AS-FE-01, AU-FE-01, ME-FE-01 (refer to `vm_inventory.md` for IPs).
    - **Proxy Status**: Enable Cloudflare proxy (orange cloud icon) for CDN and WAF protection.
    - **TTL**: 300 seconds.
  - **CNAME Records**:
    - `api.blitzhub.xyz` → `eu-be.blitzhub.xyz` (Backend entry point).
    - `ws.blitzhub.xyz` → `eu-fe.blitzhub.xyz` (WebSocket endpoint).
    - **Proxy Status**: Enable Cloudflare proxy.
    - **TTL**: 300 seconds.
  - **TXT Records** (for email and verification):
    - SPF: `v=spf1 include:_spf.google.com ~all` (for Google Workspace emails).
    - DKIM: Add if provided by your email provider.
    - **Proxy Status**: Disable proxy (gray cloud icon).
- **CNAME Flattening** (for apex domain):
  - Enable CNAME flattening to allow `blitzhub.xyz` to point to a subdomain:
    - Go to **DNS > Settings > CNAME Flattening**.
    - Select **"Flatten CNAME at apex"**.
  - Add a CNAME record:
    - Type: CNAME
    - Name: `@` (or leave blank for apex)
    - Value: `eu-fe.blitzhub.xyz`
    - **Proxy Status**: Enable proxy.
    - **TTL**: 300 seconds.

### Step 5: Configure SSL/TLS
- Ensure the site uses HTTPS for security and SEO:
  - Go to **SSL/TLS > Overview**.
  - Set Encryption Mode to **"Full (Strict)"** for end-to-end encryption.
    - **Note**: Avoid "Flexible" mode to prevent redirect loops.
  - Enable **HSTS**:
    - Go to **SSL/TLS > Edge Certificates**.
    - Enable HSTS with `max-age=31536000` (1 year) and check `includeSubDomains`.
- Cloudflare will issue a free Universal SSL certificate for `blitzhub.xyz` and subdomains.

### Step 6: Configure Page Rules for Redirection
- Redirect HTTP to HTTPS and manage apex domain access:
  - Go to **Rules > Page Rules**.
  - Add the following rules:
    1. **Redirect HTTP to HTTPS**:
       - URL: `http://blitzhub.xyz/*`
       - Setting: Forwarding URL (301 - Permanent Redirect)
       - Destination: `https://blitzhub.xyz/$1`
    2. **Redirect Subdomains to HTTPS**:
       - URL: `http://*.blitzhub.xyz/*`
       - Setting: Forwarding URL (301 - Permanent Redirect)
       - Destination: `https://$1.blitzhub.xyz/$2`
    3. **Redirect Apex to www (Optional)**:
       - URL: `https://blitzhub.xyz/*`
       - Setting: Forwarding URL (301 - Permanent Redirect)
       - Destination: `https://www.blitzhub.xyz/$1`

### Step 7: Test the Configuration
- After nameserver propagation (up to 48 hours, typically faster):
  - Access `blitzhub.xyz` in a browser.
    - **Expected**: Redirects to `https://eu-fe.blitzhub.xyz` and loads the React app.
  - Test subdomains:
    - Access `eu-fe.blitzhub.xyz` and `api.blitzhub.xyz`.
    - **Expected**: Resolves to the correct Frontend and Backend servers.
  - Verify SSL:
    - Access `https://blitzhub.xyz` and confirm the browser shows a secure connection (padlock icon).
  - Test DNS resolution:
    - Command: `dig eu-fe.blitzhub.xyz`
    - **Expected**: Resolves to Cloudflare IPs (e.g., `104.21.0.0/16`).

## Management

### 1. Renewal
- The domain must be renewed annually with GoDaddy.
- **Cost**: ~$10-$15/year for `.xyz`.
- Enable auto-renewal in GoDaddy to avoid losing the domain.

### 2. Subdomains
- Subdomains (e.g., `eu-fe.blitzhub.xyz`, `api.blitzhub.xyz`) are managed via Cloudflare (see `cloudflare_setup.md`).
- Add new subdomains as needed in the Cloudflare DNS dashboard.

### 3. Transfers
- To transfer `blitzhub.xyz` to another registrar (e.g., Cloudflare Registrar for cost savings):
  1. Unlock the domain in GoDaddy:
     - Go to **Domain Settings > Transfer domain away from GoDaddy**.
     - Disable the domain lock.
  2. Request an EPP/Authorization Code from GoDaddy.
  3. In Cloudflare, go to **Domains > Transfer Domains**.
  4. Enter `blitzhub.xyz` and provide the EPP Code.
  5. Confirm the transfer (takes 5-7 days).
  - **Cost Savings**: Cloudflare Registrar charges wholesale rates (~$8-$10/year for `.xyz`) with free WHOIS privacy, which GoDaddy often charges extra for.

## Troubleshooting

### 1. DNS Propagation Delays
- **Issue**: `blitzhub.xyz` doesn't resolve to Cloudflare after updating nameservers.
- **Solution**:
  - Wait 24-48 hours for full propagation.
  - Use `dig ns blitzhub.xyz` to check nameservers.
  - If still not updated, verify nameserver settings in GoDaddy.

### 2. Domain Not Accessible
- **Issue**: `blitzhub.xyz` doesn't load in browsers.
- **Solution**:
  - Ensure Cloudflare DNS records are correctly configured (see `cloudflare_setup.md`).
  - Check SSL/TLS settings in Cloudflare (set to "Full (Strict)").
  - Verify GoDaddy WHOIS data to ensure the domain isn't suspended.

### 3. Redirect Loops
- **Issue**: Accessing `blitzhub.xyz` results in a redirect loop.
- **Solution**:
  - Ensure SSL/TLS is set to "Full (Strict)" in Cloudflare.
  - Check Page Rules for conflicting redirections.
  - Clear Cloudflare cache: Go to **Caching > Purge Cache > Purge Everything**.

## References
- GoDaddy: [https://www.godaddy.com/](https://www.godaddy.com/)
- Cloudflare: [https://www.cloudflare.com/](https://www.cloudflare.com/)
- Cloudflare Documentation: [https://developers.cloudflare.com/](https://developers.cloudflare.com/)
