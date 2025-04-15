# Solana Domain Setup for BlitzHub (.sol)

## Overview
This document outlines the process of purchasing, configuring, and managing the `.sol` domain (`blitzhub.sol`) for the BlitzHub project using the Bonfida Solana Name Service (SNS). It includes steps to buy the domain, configure it for use with the project's infrastructure (e.g., linking to Frontend servers), and where to find related information after purchase. The domain will be used to simplify transactions, host decentralized content (e.g., via IPFS), and enhance the project's Web3 identity.

## Prerequisites
- A Solana wallet (e.g., Phantom) with at least $20 in USDC or SOL, plus a small amount of SOL for transaction fees.
- Access to a decentralized exchange (DEX) like Jupiter to swap for $FIDA tokens, if needed.
- The domain `blitzhub.sol` must be available for purchase on Bonfida.
- Familiarity with the project's infrastructure (e.g., Frontend servers like EU-FE-01, IPFS for hosting static assets).

## Purchase Process on Bonfida

### Step 1: Access Bonfida Naming Service
- Navigate to the Bonfida SNS website: [https://naming.bonfida.org/#/auctions](https://naming.bonfida.org/#/auctions).
- Connect your Solana wallet (e.g., Phantom) by clicking the "Connect Wallet" button.

### Step 2: Search for the Domain
- In the search bar, enter `blitzhub.sol`.
- Possible outcomes:
  - **Available**: Proceed to purchase.
  - **In Auction**: Join the auction (auctions typically last 3 days as of protocol updates in November 2021).
  - **Taken**: Consider a secondary marketplace like Magic Eden or Hyperspace to purchase from the current owner.

### Step 3: Purchase the Domain
- If available, select `blitzhub.sol` and add it to your cart.
- Choose the storage size:
  - Select **1KB** for basic use (e.g., transactions, linking to wallet).
  - Select **10KB** for advanced use (e.g., hosting a decentralized website via IPFS for the project's static assets like `app.js`).
  - For BlitzHub, choose **10KB** to support hosting the Frontend app via IPFS.
- Payment:
  - Bonfida accepts $FIDA, USDC, or other tokens like SRM, RAY, USDT via Jupiter Aggregator.
  - Estimated cost: ~$20 in USDC or equivalent in $FIDA, plus ~0.1 SOL for rent (covers 2 years, exempting future fees).
  - Use Phantom's native swap tool to convert SOL to $FIDA or USDC if needed.
- Click "Checkout" and approve the transaction in your wallet.
- After the transaction is confirmed (usually within seconds), the domain is linked to your wallet.

## Configuration

### Step 1: Verify Domain Ownership
- After purchase, the domain is automatically linked to the wallet used for the transaction.
- Verify ownership:
  - Visit [https://www.sns.id/profile?pubkey=YOUR_WALLET_ADDRESS](https://www.sns.id/profile?pubkey=YOUR_WALLET_ADDRESS), replacing `YOUR_WALLET_ADDRESS` with the wallet's public key.
  - Example: If your wallet address is `CZ2tsPWV7B4FdYV8Nd4aLnUSzKSD1jRzCmUaF3DX4c5n`, check [https://www.sns.id/profile?pubkey=CZ2tsPWV7B4FdYV8Nd4aLnUSzKSD1jRzCmUaF3DX4c5n](https://www.sns.id/profile?pubkey=CZ2tsPWV7B4FdYV8Nd4aLnUSzKSD1jRzCmUaF3DX4c5n).
  - Expected: `blitzhub.sol` should be listed under your wallet.
- Alternatively, check on Solana Explorer:
  - Visit [https://explorer.solana.com/address/YOUR_WALLET_ADDRESS/domains](https://explorer.solana.com/address/YOUR_WALLET_ADDRESS/domains).
  - Expected: `blitzhub.sol` should appear under the "Domains" tab.

### Step 2: Configure Domain Records
- Go to [https://www.sns.id/](https://www.sns.id/) and connect your wallet.
- Navigate to "My Domains" and select `blitzhub.sol`.
- Add records to link the domain to BlitzHub's infrastructure:
  - **URL Record**: Set to `https://eu-fe.blitzhub.sol` to redirect to the Frontend server (EU-FE-01).
    - Click "Edit" next to "Content" and input the URL.
  - **IPFS Record**: Link to the project's static assets (e.g., `app.js` hosted on IPFS).
    - Upload `app.js` to IPFS (e.g., via Pinata or Infura).
    - Set the IPFS hash (e.g., `Qm...`) in the IPFS record field.
  - **TXT Record**: Add a verification record if needed (e.g., for Twitter handle linking).
    - Example: `twitter:blitzhub` to link to the project's Twitter handle.
- Save and confirm the transaction in your wallet (small SOL gas fee applies).

### Step 3: Test the Configuration
- Test the URL redirect:
  - Open a browser (e.g., Brave, which supports `.sol` resolution) and navigate to `blitzhub.sol`.
  - Expected: Redirects to `https://eu-fe.blitzhub.sol`, showing the React app.
- Test IPFS resolution:
  - In Brave, navigate to `blitzhub.sol/app.js`.
  - Expected: Resolves to the IPFS-hosted `app.js` (e.g., via `cloudflare-ipfs.com/ipfs/Qm...`).
- Test transactions:
  - Send a small amount of SOL to `blitzhub.sol` using Phantom wallet.
  - Expected: Funds arrive in the linked wallet.

## Finding Related Information

### 1. SNS Profile
- **Location**: [https://www.sns.id/](https://www.sns.id/)
- **Details**:
  - View all domains linked to your wallet under "My Domains".
  - Manage records (e.g., URL, IPFS, TXT).
  - Transfer or sell the domain.
- **Access**: Connect your wallet and check the profile page.

### 2. Solana Explorer
- **Location**: [https://explorer.solana.com/](https://explorer.solana.com/)
- **Details**:
  - Search for your wallet address and navigate to the "Domains" tab.
  - View domain ownership and associated public keys.
- **Access**: Enter your wallet address (e.g., `CZ2tsPWV7B4FdYV8Nd4aLnUSzKSD1jRzCmUaF3DX4c5n`).

### 3. Phantom Wallet
- **Location**: Phantom browser extension or mobile app.
- **Details**:
  - Some users report that `.sol` domains may not appear directly in Phantom, but you can use the domain for transactions.
  - Send SOL to `blitzhub.sol` to confirm it resolves to your wallet.
- **Access**: Open Phantom, go to the "Send" section, and enter `blitzhub.sol`.

### 4. Secondary Marketplaces
- **Locations**:
  - Magic Eden: [https://magiceden.io/](https://magiceden.io/)
  - Hyperspace: [https://hyperspace.xyz/](https://hyperspace.xyz/)
- **Details**:
  - If you decide to sell or transfer `blitzhub.sol`, list it on these marketplaces.
  - Check market value and past sales of similar domains.
- **Access**: Connect your wallet and search for `blitzhub.sol`.

### 5. Bonfida Documentation
- **Location**: [https://docs.bonfida.org/](https://docs.bonfida.org/)
- **Details**:
  - Guides on managing domains, setting records, and integrating with dApps.
  - List of integrations (e.g., wallets and apps that support `.sol` domains).
- **Access**: Navigate to the "Solana Name Service" section.

## Management and Integration with BlitzHub

### 1. Subdomains
- Create subdomains for different services:
  - Example: `eu-fe.blitzhub.sol` for the EU Frontend server.
  - In sns.id, go to "My Domains", select `blitzhub.sol`, and add a subdomain.
  - Set records for the subdomain (e.g., URL to `https://eu-fe.blitzhub.sol`).
- Each subdomain automatically gets 2KB of storage.

### 2. Integration with Frontend
- Use the IPFS record to host the React app's static files (e.g., `app.js`, `index.html`).
- Configure Cloudflare to cache and serve IPFS content for better performance (refer to `cloudflare_setup.md`).

### 3. Transfers
- To transfer `blitzhub.sol` to another wallet (e.g., for team management):
  - Go to sns.id, select "Transfer", enter the new wallet address, and confirm the transaction (small SOL gas fee).
  - Note: Transfers are irreversible; ensure the recipient address is correct.

### 4. Use in Transactions
- Use `blitzhub.sol` for transactions instead of the wallet's public key.
- Example: In Phantom, send SOL to `blitzhub.sol` instead of `CZ2tsPWV7B4FdYV8Nd4aLnUSzKSD1jRzCmUaF3DX4c5n`.

## Troubleshooting

### 1. Domain Not Appearing in Wallet
- **Issue**: `blitzhub.sol` doesn't show in Phantom or sns.id.
- **Solution**:
  - Ensure the purchase transaction was successful (check Solana Explorer for the transaction).
  - Wait a few minutes for the blockchain to update.
  - Verify the wallet used for purchase is connected to sns.id.
  - If still not visible, check Bonfida forums or support for assistance.

### 2. Domain Not Resolving in Browser
- **Issue**: Navigating to `blitzhub.sol` in Brave doesn't redirect to `eu-fe.blitzhub.sol`.
- **Solution**:
  - Ensure the URL record is set correctly in sns.id.
  - Brave resolves `.sol` domains via Bonfida's Name Resolver, prioritizing URL, then IPFS records.
  - Clear browser cache and try again.

### 3. Transaction to Domain Fails
- **Issue**: Sending SOL to `blitzhub.sol` fails in wallets like Solflare.
- **Solution**:
  - Not all wallets support `.sol` domains. Use Phantom, which has better integration.
  - Verify the domain is linked to the correct wallet in sns.id.

## References
- Bonfida SNS: [https://naming.bonfida.org/](https://naming.bonfida.org/)
- SNS Profile: [https://www.sns.id/](https://www.sns.id/)
- Solana Explorer: [https://explorer.solana.com/](https://explorer.solana.com/)
- Bonfida Documentation: [https://docs.bonfida.org/](https://docs.bonfida.org/)
- QuickNode Guide: [https://www.quicknode.com/guides/](https://www.quicknode.com/guides/)
