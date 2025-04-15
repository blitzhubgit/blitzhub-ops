let currentLimit = 100; // Transações por segundo

    setInterval(async () => {
      const cpuUsage = await getCPUUsage(); // Função fictícia para medir uso da CPU
      if (cpuUsage > 200) {
        currentLimit = 20;
      } else {
        currentLimit = 100;
      }
    }, 1000);

    fastify.post('/trade', async (request, reply) => {
      const { tokenAddress, type, amount, userWallet } = request.body;
      const queueSize = await getQueueSize(`trades:${tokenAddress}`); // Função fictícia
      if (queueSize > currentLimit) {
        reply.code(429).send(); // Rejeição silenciosa (HTTP 429 Too Many Requests)
        return;
      }
      const conn = await amqp.connect('amqp://localhost');
      const channel = await conn.createChannel();
      await channel.assertQueue(`trades:${tokenAddress}`, { durable: true });
      channel.sendToQueue(`trades:${tokenAddress}`, Buffer.from(JSON.stringify({ tokenAddress, type, amount, userWallet })));
      await channel.close();
      await conn.close();
      return { success: true };
    });
