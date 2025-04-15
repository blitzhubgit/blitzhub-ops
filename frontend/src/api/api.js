async function getTokenList() {
      const response = await fetch('/api/tokens/list');
      return await response.json();
    }

    async function getPriceHistory(contractAddress, interval = '1m') {
      const response = await fetch(`/api/token/${contractAddress}/price-history?interval=${interval}`);
      return await response.json();
    }

    async function submitTrade(tokenAddress, type, amount, userWallet) {
      const response = await fetch('/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress, type, amount, userWallet }),
      });
      return await response.json();
    }
