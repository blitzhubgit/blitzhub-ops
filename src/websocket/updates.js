const redis = require('redis');
    const pub = redis.createClient();
    const sub = redis.createClient();

    sub.subscribe('trade_updates');

    sub.on('message', (channel, message) => {
      const update = JSON.parse(message);
      const { tokenAddress } = update;
      const clients = tokenClients.get(tokenAddress);
      if (clients) {
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              price: update.price,
              marketCap: update.marketCap,
              volume24h: update.volume24h,
              liquidity: update.liquidity,
              holders: update.holders
            }));
          }
        });
      }
    });
