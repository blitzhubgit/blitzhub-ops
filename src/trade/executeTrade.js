async function executeTrade(tokenAddress, type, amount, userWallet) {
      const dbConnection = await sql.getConnection({
        user: 'admin',
        password: 'BlitzHub2025!',
        connectString: 'TokensDBEUFE01_high'
      });

      // 1. Confirmação na Solana
      const transactionId = 'tx_' + Date.now();
      await solanaConnection.sendTransaction(tokenAddress, type, amount, transactionId);

      // 2. Obter supply atual
      const supplyResult = await dbConnection.execute(
        `SELECT current_supply, total_supply, volume_24h FROM Tokens WHERE token_address = :1 FOR UPDATE`,
        [tokenAddress]
      );
      let currentSupply = supplyResult.rows[0]?.CURRENT_SUPPLY || 0;
      let totalSupply = supplyResult.rows[0]?.TOTAL_SUPPLY || 0;
      let volume24h = supplyResult.rows[0]?.VOLUME_24H || 0;

      // 3. Atualizar supply
      if (type === 'buy') {
        currentSupply += amount;
      } else if (type === 'sell') {
        currentSupply -= amount;
      }

      // 4. Calcular métricas (Bonding Curve e indicadores)
      const k = 0.000000001;
      const n = 1;
      const price = k * Math.pow(currentSupply, n); // Bonding Curve
      const marketCap = price * totalSupply; // Market Cap
      const totalUSD = price * amount; // Total USD
      volume24h += totalUSD; // Volume 24h
      const liquidity = marketCap * 0.05; // Liquidity

      // 5. Atualizar saldo do usuário
      const balanceAdjustment = type === 'buy' ? amount : -amount;
      await dbConnection.execute(
        `INSERT INTO UserBalances (user_address, token_address, balance)
         VALUES (:1, :2, :3)
         ON DUPLICATE KEY UPDATE balance = balance + :4`,
        [userWallet, tokenAddress, balanceAdjustment, balanceAdjustment]
      );
      await dbConnection.execute(
        `DELETE FROM UserBalances 
         WHERE user_address = :1 AND token_address = :2 AND balance <= 0`,
        [userWallet, tokenAddress]
      );

      // 6. Calcular holders
      const holdersResult = await dbConnection.execute(
        `SELECT COUNT(*) as holders_count FROM UserBalances WHERE token_address = :1`,
        [tokenAddress]
      );
      const holders = holdersResult.rows[0].HOLDERS_COUNT;

      // 7. Atualizar Tokens
      const createdAtResult = await dbConnection.execute(
        `SELECT created_at FROM Tokens WHERE token_address = :1`,
        [tokenAddress]
      );
      const createdAt = createdAtResult.rows[0].CREATED_AT;
      const age = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000); // Age

      await dbConnection.execute(
        `UPDATE Tokens SET current_supply = :1, market_cap = :2, volume_24h = :3, liquidity = :4, holders_count = :5 WHERE token_address = :6`,
        [currentSupply, marketCap, volume24h, liquidity, holders, tokenAddress]
      );

      // 8. Registrar transação
      await dbConnection.execute(
        `INSERT INTO Transactions (transaction_id, token_address, type, total_usd, amount, price, maker, timestamp)
         VALUES (:1, :2, :3, :4, :5, :6, :7, NOW())`,
        [transactionId, tokenAddress, type, totalUSD, amount, price, userWallet]
      );

      // 9. Atualizar candlestick
      const currentMinute = new Date(Math.floor(Date.now() / 60000) * 60000);
      const candlestickResult = await dbConnection.execute(
        `SELECT open, high, low, close, volume 
         FROM PriceHistory 
         WHERE token_address = :1 AND interval = '1m' AND timestamp = :2`,
        [tokenAddress, currentMinute]
      );

      if (candlestickResult.rows.length > 0) {
        const { OPEN, HIGH, LOW, CLOSE, VOLUME } = candlestickResult.rows[0];
        await dbConnection.execute(
          `UPDATE PriceHistory 
           SET high = :1, low = :2, close = :3, volume = :4 
           WHERE token_address = :5 AND interval = '1m' AND timestamp = :6`,
          [
            Math.max(HIGH, price),
            Math.min(LOW, price),
            price,
            VOLUME + totalUSD,
            tokenAddress,
            currentMinute,
          ]
        );
      } else {
        await dbConnection.execute(
          `INSERT INTO PriceHistory (token_address, interval, timestamp, open, high, low, close, volume)
           VALUES (:1, '1m', :2, :3, :4, :5, :6, :7)`,
          [tokenAddress, currentMinute, price, price, price, price, totalUSD]
        );
      }

      await dbConnection.commit();
      await dbConnection.close();

      // 10. Enviar atualização via WebSocket
      const update = { price, marketCap, volume24h, liquidity, holders };
      await pub.publish('trade_updates', JSON.stringify({ tokenAddress, ...update }));
    }
