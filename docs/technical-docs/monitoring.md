# Monitoring

    ## Metrics

    - **Backend**:
      - CPU usage (%)
      - Transactions per second
    - **Database**:
      - Queries per second (QPS)
      - Average query time
      - Lock contention
    - **RabbitMQ**:
      - Queue size per token
      - Processing rate
    - **Solana**:
      - Transaction confirmation latency
      - Failure rate
    - **WebSocket**:
      - Active connections
      - Update latency
    - **User Experience**:
      - Average frontend update time
      - Transaction rejection rate during peaks

    ## Tools

    - **CloudWatch/Prometheus**: Monitors CPU, QPS, latencies.
    - **RabbitMQ Dashboard**: Monitors queues.
    - **Solana Explorer**: Monitors blockchain confirmations.
    - **Backend Logs**: Logs timing for each step (Solana, DB, WebSocket).

    ## Alerts

    - **CPU > 200%**: Reduce transaction limit.
    - **QPS > 900**: Investigate database contention.
    - **Queue Size > 500**: Investigate processing delays.
