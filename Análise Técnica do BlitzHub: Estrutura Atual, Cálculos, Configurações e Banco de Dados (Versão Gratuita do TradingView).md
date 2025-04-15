# Análise Técnica do BlitzHub: Estrutura Atual, Cálculos, Configurações e Banco de Dados

## 1. Introdução

O BlitzHub é uma plataforma de tokens que utiliza uma **bonding curve** para gerenciar preços, suportando 16.000 usuários simultâneos. A página inicial exibe seções de tokens ("New Tokens", "Trending", "About to Graduate"), e a página de detalhes apresenta um gráfico do TradingView (candlesticks de 1 minuto, atualizados com base em eventos buy/sell). Este documento detalha os desafios enfrentados com a estrutura atual, os cálculos e indicadores necessários, as soluções propostas, as configurações para integração com o TradingView e a API do frontend, e as estruturas do banco de dados, que agora assumem um papel maior ao reduzir a dependência dos nós da Solana.

---

## 2. Problema Enfrentado com a Estrutura Atual

### 2.1. Arquitetura Atual

- **Backends**: 2 VMs A1.Flex (4 OCPU, 4.000ms de CPU por segundo cada):
  - EU-BE-01 (primário).
  - NA-BE-01 (failover, modo ativo-passivo).
- **Banco de Dados**: Autonomous Database (TokensDBEUFE01, 1 OCPU, 1.000 QPS).
- **Load Balancer**: Cloudflare.
- **Mensageria**: RabbitMQ (para enfileirar transações).
- **Cache**: Redis (para métricas e Pub/Sub).
- **Blockchain**: Solana (para assinar contratos buy/sell).

### 2.2. Requisitos

- **Usuários Simultâneos**: 16.000.
- **Transações**: Atualizações baseadas em eventos (buy/sell).
- **Gráfico**: Candlesticks de 1 minuto no TradingView, atualizados em tempo real.
- **Métricas**: Preço, Market Cap, Volume 24h, Liquidity, Holders, Age.
- **Prioridade**: Confirmação na Solana antes de atualizar o banco de dados.
- **Novo Foco**: Reduzir dependência dos nós da Solana, transferindo mais dados e lógica para o banco de dados.

### 2.3. Problemas Identificados

- **Sobrecarga no Backend**:
  - No modo ativo-passivo, o backend primário (EU-BE-01) processa todas as transações.
  - Com 100 transações por segundo: 494% da CPU por backend (no modo ativo-ativo).
- **Latência da Solana**:
  - Cada transação requer confirmação na Solana (\~350ms), aumentando o tempo total por trade (\~465ms).
- **Picos de Hype**:
  - Picos de 500 transações por segundo (1-2 segundos) sobrecarregam o sistema, causando atrasos (\~1.000ms por trade) ou rejeição de transações.
- **Contenção no Banco de Dados**:
  - Múltiplas atualizações na tabela `Tokens` podem causar bloqueios, especialmente no modo ativo-ativo.
- **Dependência dos Nós da Solana**:
  - Consultas frequentes à Solana (e.g., para holders) aumentam a latência e a carga externa.

---

## 3. Cálculos e Indicadores Necessários

### 3.1. Bonding Curve

- **Fórmula**: ( \\text{Preço} = k \\times \\text{Supply}^n )

  - ( k = 0.000000001 ) (constante).
  - ( n = 1 ) (curva linear, para simplificação).

- **Cálculo**:

  ```javascript
  const k = 0.000000001;
  const n = 1;
  function calculatePrice(currentSupply) {
    return k * Math.pow(currentSupply, n);
  }
  ```

- **Tempo**: \~0,1ms.

### 3.2. Indicadores

- **Supply Atual (current_supply)**:

  - Buy: `current_supply += amount`.
  - Sell: `current_supply -= amount`.
  - Tempo: \~0,1ms.

- **Market Cap**:

  - ( \\text{Market Cap} = \\text{Preço} \\times \\text{Total Supply} ).
  - Tempo: \~0,1ms.

- **Total USD**:

  - ( \\text{Total USD} = \\text{Preço} \\times \\text{Amount} ).
  - Tempo: \~0,1ms.

- **Volume 24h**:

  - `volume_24h += Total USD`.
  - Tempo: \~0,1ms (cálculo) + 20ms (query).

- **Liquidity**:

  - Exemplo: `liquidity = 0.05 * Market Cap`.
  - Tempo: \~0,1ms.

- **Holders**:

  - Calculado via tabela `UserBalances`:

    ```sql
    SELECT COUNT(*) as holders_count FROM UserBalances WHERE token_address = :tokenAddress;
    ```

  - Tempo: \~20ms.

- **Age**:

  - ( \\text{Age} = \\text{Current Timestamp} - \\text{Created At} ).
  - Tempo: \~0,1ms.

- **Candlestick (PriceHistory)**:

  - Campos: `open`, `high`, `low`, `close`, `volume`.
  - Lógica:
    - Se candlestick existe: Atualiza `high`, `low`, `close`, `volume`.
    - Se não: Cria novo candlestick.
  - Tempo: \~20ms (query) + 0,1ms (cálculo).

### 3.3. Tempo Total dos Cálculos

- **Por Trade**: 0,6ms (cálculos) + 60ms (queries) = **60,6ms**.

---

## 4. Fluxo: Ação → Cálculo → Disponibilização

### 4.1. Fluxo Atual

1. **Ação (Trade)**: Usuário envia buy/sell (10ms de latência de rede).
2. **Enfileiramento (RabbitMQ)**: 10ms.
3. **Confirmação na Solana**: 350ms.
4. **Cálculos e Banco de Dados**: 60ms.
5. **Publicação no Redis (WebSocket)**: 5ms.
6. **Envio via WebSocket**: 10ms.
7. **Frontend (Renderização)**: 50ms.

### 4.2. Tempo Total

- **Média**: 10ms + 10ms + 350ms + 60ms + 5ms + 10ms + 50ms = **495ms**.
- **Pico (140% da CPU)**: +50ms de latência no backend = **545ms**.

---

## 5. Soluções Propostas

### 5.1. Modo Ativo-Ativo

- **Mudança**: Ambos os backends (EU-BE-01 e NA-BE-01) processam transações.
- **Distribuição**:
  - 50/50 via Load Balancer (Cloudflare).
  - 16.000 conexões WebSocket: 8.000 por backend.
- **Coordenação**:
  - RabbitMQ: Fila por token para evitar contenção.
  - Redis Pub/Sub: Sincroniza atualizações WebSocket.
- **Impacto**:
  - Com 100 transações por segundo (50 por backend):
    - Carga: 535% da CPU por backend.
  - Com limite de 20 transações por segundo (10 por backend):
    - Carga: 140% da CPU por backend.

### 5.2. Limite de Transações

- **Opção 1: 100 Transações por Segundo**:
  - Carga: 535% da CPU por backend.
  - Pico de 1.000 transações (2 segundos):
    - Todas processadas, mas backlog de 10 segundos.
    - Latência: \~1.000ms por trade.
- **Opção 2: 20 Transações por Segundo**:
  - Carga: 140% da CPU por backend.
  - Pico de 1.000 transações:
    - 40 processadas, 960 rejeitadas.
    - Latência: \~545ms por trade.
- **Solução Híbrida**:
  - Normal: 100 transações por segundo.
  - Picos (CPU &gt; 200%): Reduz para 20 transações por segundo.

### 5.3. Otimizações

- **Índices no Banco de Dados**:
  - `CREATE INDEX idx_userbalances_token ON UserBalances(token_address);`
  - Reduz queries de 20ms para 10ms.
- **Cache**:
  - TTL de 30 segundos no Cloudflare e Redis para dados iniciais.

---

## 6. Estruturas do Banco de Dados

O banco de dados (Autonomous Database) será expandido para reduzir a dependência dos nós da Solana, armazenando mais informações localmente. Abaixo estão as tabelas, suas colunas, índices e papéis no sistema.

### 6.1. Tabela: `Tokens`

- **Descrição**: Armazena informações sobre cada token.

- **Estrutura**:

  ```sql
  CREATE TABLE Tokens (
    token_address VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100),
    current_supply DECIMAL(18, 2),
    total_supply DECIMAL(18, 2),
    market_cap DECIMAL(18, 2),
    volume_24h DECIMAL(18, 2),
    liquidity DECIMAL(18, 2),
    holders_count INT,
    created_at TIMESTAMP
  );
  ```

- **Índices**:

  - Índice primário em `token_address`.

  - Índice para consultas frequentes:

    ```sql
    CREATE INDEX idx_tokens_created_at ON Tokens(created_at);
    CREATE INDEX idx_tokens_volume_24h ON Tokens(volume_24h);
    ```

- **Papel**:

  - Armazena métricas principais do token (Supply, Market Cap, Volume 24h, Liquidity, Holders, Age).
  - Usada para exibir dados na página inicial e de detalhes.
  - Atualizada após cada transação (buy/sell).

- **Liberação dos Nós da Solana**:

  - Antes, métricas como `holders_count` eram sincronizadas com a Solana. Agora, são calculadas localmente via `UserBalances`.

### 6.2. Tabela: `UserBalances`

- **Descrição**: Registra o saldo de cada usuário por token.

- **Estrutura**:

  ```sql
  CREATE TABLE UserBalances (
    user_address VARCHAR(255),
    token_address VARCHAR(255),
    balance DECIMAL(18, 2),
    PRIMARY KEY (user_address, token_address)
  );
  ```

- **Índices**:

  - Índice primário composto (`user_address`, `token_address`).

  - Índice para cálculo de holders:

    ```sql
    CREATE INDEX idx_userbalances_token ON UserBalances(token_address);
    ```

- **Papel**:

  - Calcula o número de holders por token (`holders_count`).
  - Suporta a página de perfil do usuário (mostra tokens possuídos e seus valores).
  - Atualizada após cada transação:
    - Buy: Incrementa o saldo.
    - Sell: Decrementa o saldo (remove se &lt;= 0).

- **Liberação dos Nós da Solana**:

  - Elimina a necessidade de consultar a Solana para obter os holders, reduzindo latência e carga externa.

### 6.3. Tabela: `Transactions`

- **Descrição**: Registra todas as transações (buy/sell).

- **Estrutura**:

  ```sql
  CREATE TABLE Transactions (
    transaction_id VARCHAR(255) PRIMARY KEY,
    token_address VARCHAR(255),
    type VARCHAR(10), -- 'buy' ou 'sell'
    total_usd DECIMAL(18, 2),
    amount DECIMAL(18, 2),
    price DECIMAL(18, 2),
    maker VARCHAR(255),
    timestamp TIMESTAMP
  );
  ```

- **Índices**:

  - Índice primário em `transaction_id`.

  - Índices para consultas:

    ```sql
    CREATE INDEX idx_transactions_token ON Transactions(token_address);
    CREATE INDEX idx_transactions_timestamp ON Transactions(timestamp);
    ```

- **Papel**:

  - Armazena histórico de transações.
  - Usada para auditoria e para calcular métricas como `volume_24h` (se necessário reprocessar).

- **Liberação dos Nós da Solana**:

  - Permite rastrear transações localmente, reduzindo a necessidade de consultar a Solana para histórico.

### 6.4. Tabela: `PriceHistory`

- **Descrição**: Armazena candlesticks para o gráfico do TradingView.

- **Estrutura**:

  ```sql
  CREATE TABLE PriceHistory (
    token_address VARCHAR(255),
    interval VARCHAR(10), -- '1m', '5m', etc.
    timestamp TIMESTAMP,
    open DECIMAL(18, 2),
    high DECIMAL(18, 2),
    low DECIMAL(18, 2),
    close DECIMAL(18, 2),
    volume DECIMAL(18, 2),
    PRIMARY KEY (token_address, interval, timestamp)
  );
  ```

- **Índices**:

  - Índice primário composto (`token_address`, `interval`, `timestamp`).

  - Índice para consultas históricas:

    ```sql
    CREATE INDEX idx_pricehistory_token_interval ON PriceHistory(token_address, interval);
    ```

- **Papel**:

  - Fornece dados históricos para o gráfico do TradingView.
  - Atualizada após cada transação (atualiza ou cria candlestick do minuto atual).

- **Liberação dos Nós da Solana**:

  - Armazena preços localmente, eliminando consultas à Solana para dados históricos.

### 6.5. Tabela: `Users`

- **Descrição**: Armazena informações dos usuários (nova funcionalidade).

- **Estrutura**:

  ```sql
  CREATE TABLE Users (
    user_address VARCHAR(255) PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP,
    last_login TIMESTAMP
  );
  ```

- **Índices**:

  - Índice primário em `user_address`.

  - Índice para autenticação:

    ```sql
    CREATE INDEX idx_users_email ON Users(email);
    ```

- **Papel**:

  - Suporta autenticação e perfil do usuário.
  - Permite associar transações (`maker`) a usuários específicos.

- **Liberação dos Nós da Solana**:

  - Armazena dados de usuários localmente, eliminando a necessidade de consultar a Solana para informações de carteiras.

### 6.6. Impacto no Desempenho

- **Queries por Transação**:
  - Select `current_supply`: \~10ms (com índices).
  - Update `UserBalances`: \~10ms.
  - Select `holders_count`: \~10ms.
  - Update `Tokens`: \~10ms.
  - Insert `Transactions`: \~10ms.
  - Update/Insert `PriceHistory`: \~10ms.
  - Total: \~60ms (como antes, mas otimizado com índices).
- **Redução de Consultas à Solana**:
  - Holders, histórico de transações e preços agora são gerenciados localmente.
  - Solana é usada apenas para confirmar transações (buy/sell), mantendo a latência de \~350ms por trade.

---

## 7. Configurações Necessárias: TradingView e API para o Frontend

### 7.1. Integração com o TradingView

- **Objetivo**:

  - Exibir candlesticks de 1 minuto na página de detalhes do token, com atualizações em tempo real baseadas em eventos (buy/sell).

- **Componente**:

  - Utiliza o widget `AdvancedChart` do TradingView.

- **Configuração**:

  - **Datafeed**:

    - `onReady`: Define resoluções suportadas (1m, 5m, 15m, 60m).
    - `getBars`: Fornece candlesticks históricos via endpoint `/api/token/{contractAddress}/price-history`.
    - `subscribeBars`: Assina atualizações em tempo real via WebSocket.

  - **Código**:

    ```javascript
    const TokenChart = ({ contractAddress }) => {
      return (
        <AdvancedChart
          symbol="MOON"
          interval="1"
          datafeed={{
            onReady: (callback) => callback({ supported_resolutions: ["1", "5", "15", "60"] }),
            getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback) => {
              const response = await fetch(`/api/token/${contractAddress}/price-history?interval=1m`);
              const bars = await response.json();
              onHistoryCallback(bars, { noData: false });
            },
            subscribeBars: (symbolInfo, resolution, onRealtimeCallback) => {
              const ws = new WebSocket(`wss://eu-be.blitzhub.xyz/token/${contractAddress}/updates`);
              ws.onmessage = (event) => {
                const update = JSON.parse(event.data);
                onRealtimeCallback({
                  time: new Date().getTime(),
                  close: update.price,
                  volume: update.volume24h,
                });
              };
            },
          }}
        />
      );
    };
    ```

- **O que Faz**:

  - Exibe o gráfico de preços do token, com candlesticks de 1 minuto.
  - Atualiza o candlestick atual em tempo real com base em transações (buy/sell).

- **O que Representa**:

  - Representa a evolução do preço do token, essencial para os usuários acompanharem o mercado e tomarem decisões de compra/venda.

### 7.2. API para Conectar com o Frontend

- **Objetivo**:

  - Fornecer dados para a página inicial e de detalhes, e processar transações (buy/sell).

- **Endpoints**:

  - `/api/tokens/list` (Página Inicial):

    - Retorna dados das seções "New Tokens", "Trending", e "About to Graduate".

    - **Estrutura da Resposta**:

      ```json
      {
        "newTokens": [
          { "tokenAddress": "abc", "name": "Maggie Justice", "liquidity": 1950, "marketCap": 41000, "holders": 150, "age": 391 }
        ],
        "trending": [...],
        "aboutToGraduate": [...]
      }
      ```

    - **Código**:

      ```javascript
      fastify.get('/tokens/list', async (request, reply) => {
        const dbConnection = await sql.getConnection({
          user: 'admin',
          password: 'BlitzHub2025!',
          connectString: 'TokensDBEUFE01_high'
        });
      
        const newTokens = await dbConnection.execute(
          `SELECT token_address, name, liquidity, market_cap, holders_count, created_at 
           FROM Tokens 
           ORDER BY created_at DESC 
           LIMIT 5`
        );
      
        const trending = await dbConnection.execute(
          `SELECT token_address, name, liquidity, market_cap, holders_count, created_at 
           FROM Tokens 
           ORDER BY volume_24h DESC 
           LIMIT 5`
        );
      
        const aboutToGraduate = await dbConnection.execute(
          `SELECT token_address, name, liquidity, market_cap, holders_count, created_at 
           FROM Tokens 
           WHERE market_cap >= 50000 
           ORDER BY market_cap DESC 
           LIMIT 5`
        );
      
        await dbConnection.close();
      
        const formatToken = (row) => ({
          tokenAddress: row.TOKEN_ADDRESS,
          name: row.NAME,
          liquidity: row.LIQUIDITY,
          marketCap: row.MARKET_CAP,
          holders: row.HOLDERS_COUNT,
          age: Math.floor((Date.now() - new Date(row.CREATED_AT).getTime()) / 1000),
        });
      
        return {
          newTokens: newTokens.rows.map(formatToken),
          trending: trending.rows.map(formatToken),
          aboutToGraduate: aboutToGraduate.rows.map(formatToken),
        };
      });
      ```

  - `/api/token/{contractAddress}/price-history` (Gráfico Histórico):

    - Retorna candlesticks para o TradingView.

    - **Estrutura da Resposta**:

      ```json
      [
        { "time": 1710000000000, "open": 0.00001, "high": 0.000015, "low": 0.000008, "close": 0.000012, "volume": 500 }
      ]
      ```

  - `/trade` (Processar Buy/Sell):

    - Enfileira transações para processamento.

    - **Estrutura da Requisição**:

      ```json
      { "tokenAddress": "abc", "type": "buy", "amount": 1000, "userWallet": "wallet123" }
      ```

    - **Resposta**:

      ```json
      { "success": true, "message": "Trade queued" }
      ```

- **WebSocket**:

  - **URL**: `wss://eu-be.blitzhub.xyz/token/{contractAddress}/updates`

  - **Mensagens**:

    ```json
    { "price": 0.000012, "marketCap": 41000, "volume24h": 5000, "liquidity": 1950, "holders": 150 }
    ```

- **O que Faz**:

  - Fornece dados iniciais para a UI (página inicial e gráfico).
  - Processa transações (buy/sell) e envia atualizações em tempo real.

- **O que Representa**:

  - Interface entre o backend e o frontend, garantindo que os usuários vejam métricas atualizadas e possam interagir com o sistema (comprar/vender tokens).

---

## 8. Necessidades de Monitoramento

### 8.1. Métricas Críticas

- **Carga do Backend**:
  - Uso da CPU por backend (%).
  - Número de transações por segundo.
- **Banco de Dados**:
  - QPS (Queries por Segundo).
  - Tempo médio das queries.
  - Bloqueios (contenção).
- **RabbitMQ**:
  - Tamanho das filas por token.
  - Taxa de processamento.
- **Solana**:
  - Latência de confirmação das transações.
  - Taxa de falhas.
- **WebSocket**:
  - Número de conexões ativas.
  - Latência de envio das atualizações.
- **Experiência do Usuário**:
  - Tempo médio para atualização no frontend.
  - Taxa de rejeição de transações durante picos.

### 8.2. Ferramentas

- **CloudWatch/Prometheus**: Monitorar CPU, QPS, latências.
- **RabbitMQ Dashboard**: Monitorar filas.
- **Solana Explorer**: Monitorar confirmações na blockchain.
- **Logs do Backend**:
  - Registrar tempos de cada etapa (Solana, BD, WebSocket).

### 8.3. Alertas

- **CPU &gt; 200%**: Reduzir limite de transações.
- **QPS &gt; 900**: Investigar contenção no BD.
- **Tamanho da Fila &gt; 500**: Aumentar limite ou investigar atrasos.

---

## 9. Conclusão

A estrutura atual do BlitzHub enfrenta desafios de sobrecarga e latência devido à prioridade à Solana e picos de transações. O modo ativo-ativo e o limite dinâmico de transações (100 normalmente, 20 em picos) oferecem um equilíbrio entre volume e estabilidade. A integração com o TradingView e a API do frontend permitem uma interface fluida para os usuários. A expansão das estruturas do banco de dados reduz significativamente a dependência dos nós da Solana, armazenando métricas e transações localmente. Monitoramento detalhado será essencial para garantir desempenho e identificar gargalos.
