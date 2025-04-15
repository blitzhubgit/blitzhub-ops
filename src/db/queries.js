async function getTokenSupply(tokenAddress, dbConnection) {
      const result = await dbConnection.execute(
        `SELECT current_supply, total_supply, volume_24h FROM Tokens WHERE token_address = :1 FOR UPDATE`,
        [tokenAddress]
      );
      return result.rows[0];
    }

    async function updateTokenMetrics(tokenAddress, metrics, dbConnection) {
      await dbConnection.execute(
        `UPDATE Tokens SET current_supply = :1, market_cap = :2, volume_24h = :3, liquidity = :4, holders_count = :5 WHERE token_address = :6`,
        [
          metrics.currentSupply,
          metrics.marketCap,
          metrics.volume24h,
          metrics.liquidity,
          metrics.holders,
          tokenAddress
        ]
      );
    }

    async function getHoldersCount(tokenAddress, dbConnection) {
      const result = await dbConnection.execute(
        `SELECT COUNT(*) as holders_count FROM UserBalances WHERE token_address = :1`,
        [tokenAddress]
      );
      return result.rows[0].HOLDERS_COUNT;
    }

    async function insertTransaction(transaction, dbConnection) {
      await dbConnection.execute(
        `INSERT INTO Transactions (transaction_id, token_address, type, total_usd, amount, price, maker, timestamp)
         VALUES (:1, :2, :3, :4, :5, :6, :7, NOW())`,
        [
          transaction.transactionId,
          transaction.tokenAddress,
          transaction.type,
          transaction.totalUSD,
          transaction.amount,
          transaction.price,
          transaction.maker
        ]
      );
    }

    async function getCandlestick(tokenAddress, timestamp, dbConnection) {
      const result = await dbConnection.execute(
        `SELECT open, high, low, close, volume 
         FROM PriceHistory 
         WHERE token_address = :1 AND interval = '1m' AND timestamp = :2`,
        [tokenAddress, timestamp]
      );
      return result.rows[0];
    }

    async function updateCandlestick(tokenAddress, timestamp, candlestick, dbConnection) {
      await dbConnection.execute(
        `UPDATE PriceHistory 
         SET high = :1, low = :2, close = :3, volume = :4 
         WHERE token_address = :5 AND interval = '1m' AND timestamp = :6`,
        [
          candlestick.high,
          candlestick.low,
          candlestick.close,
          candlestick.volume,
          tokenAddress,
          timestamp
        ]
      );
    }

    async function insertCandlestick(tokenAddress, timestamp, candlestick, dbConnection) {
      await dbConnection.execute(
        `INSERT INTO PriceHistory (token_address, interval, timestamp, open, high, low, close, volume)
         VALUES (:1, '1m', :2, :3, :4, :5, :6, :7)`,
        [
          tokenAddress,
          timestamp,
          candlestick.open,
          candlestick.high,
          candlestick.low,
          candlestick.close,
          candlestick.volume
        ]
      );
    }
