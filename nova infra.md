# Infraestrutura Completa VCN Única para BlitzHub

Este documento detalha a infraestrutura do **BlitzHub** com **15 contas Oracle Free Tier**, usando uma **VCN única** (`10.0.0.0/16`) gerenciada por **EU-NET-01**, com **subnets segregadas** para funções (Frontend, Backend, Solana, Segurança, Monitoramento, Gerenciamento, Helius Failover, Logs, Gestão de Rede), configurável via **GUI do Oracle Cloud**. A estrutura é profissional, otimizada para **latência de \~1-2ms** na região, com **segurança estática** e monitoramento robusto.

## 1. Visão Geral

- **Conta Principal**: EU-NET-01 (Zabbix, UFW).
- **VCN**: `10.0.0.0/16`, hospedada em EU-NET-01.
- **Contas**: 15 (5 Frontend, 2 Backend, 2 Solana, 1 Segurança, 1 Monitoramento, 1 Gerenciamento, 1 Helius Failover, 1 Logs, 1 Gestão de Rede).
- **Subnets**: 9 (públicas/privadas).
- **Load Balancers**: 15 Flexible, 3 Network.
- **Latência**: \~1-2ms na região, \~5-10ms entre regiões.
- **Armazenamento**:
  - File Storage: 400 GB (EU-LOG-01, \~294 GB logs, 100 GB snapshots, 7 dias).
  - Block Volumes: 3 TB usados (15 contas x 200 GB), de \~9 TB disponíveis.
- **Performance**:
  - Frontend: \~25.000 req/s.
  - Backend: \~10.000 req/s.
  - Solana: \~70.000 tx/hora.
  - Helius Failover: \~5000 tx/hora.
  - Usuários: \~1000 simultâneos.
- **SLOs**: &lt;50ms APIs, &lt;25ms assets, &lt;100ms failover.

## 2. Estrutura de Rede

### VCN

- **Nome**: BlitzHubVCN
- **CIDR**: `10.0.0.0/16`
- **Conta**: EU-NET-01
- **GUI**: Networking &gt; Virtual Cloud Networks &gt; Create VCN

### Subnets

| Função | Subnet CIDR | Tipo | Contas |
| --- | --- | --- | --- |
| Frontend | 10.0.1.0/24 | Pública | EU-FE-01, NA-FE-01, SA-FE-01, AS-FE-01, AU-FE-01 |
| Backend | 10.0.2.0/24 | Pública | EU-BE-01, NA-BE-01 |
| Solana | 10.0.3.0/24 | Pública | EU-SOL-01, AS-SOL-01 |
| Segurança | 10.0.4.0/24 | Privada | EU-SEC-01 |
| Monitoramento | 10.0.5.0/24 | Privada | EU-MON-01 |
| Gerenciamento | 10.0.6.0/24 | Privada | EU-MGMT-01 |
| Helius Failover | 10.0.7.0/24 | Pública | EU-FAIL-01 |
| Logs | 10.0.8.0/24 | Pública | EU-LOG-01 |
| Gestão de Rede | 10.0.9.0/24 | Privada | EU-NET-01 |

- **GUI**: Networking &gt; Subnets &gt; Create Subnet
- **Configuração**:
  - **Públicas**: Internet Gateway para Load Balancers.
  - **Privadas**: NAT Gateway para Egress, sem Ingress externo.

### Security Lists

| Subnet | Regras de Ingress | Regras de Egress |
| --- | --- | --- |
| Frontend | TCP 80, 443 (Cloudflare IPs) | TCP 3000 (10.0.2.0/24), 8899 (10.0.3.0/24), 3100 (10.0.8.0/24) |
| Backend | TCP 3000 (10.0.1.0/24, 10.0.6.0/24) | TCP 8899 (10.0.3.0/24), 3100 (10.0.8.0/24) |
| Solana | TCP 8899 (10.0.1.0/24, 10.0.2.0/24) | TCP 3100 (10.0.8.0/24) |
| Segurança | TCP 8200 (10.0.6.0/24) | TCP 3100 (10.0.8.0/24) |
| Monitoramento | TCP 9090 (10.0.6.0/24) | TCP 3100 (10.0.8.0/24), 10050 (10.0.9.0/24) |
| Gerenciamento | TCP 22, 8080 (admin IPs) | TCP 8200 (10.0.4.0/24), 9090 (10.0.5.0/24), 3100 (10.0.8.0/24) |
| Helius Failover | TCP 8899 (10.0.1.0/24, 10.0.2.0/24) | TCP 3100 (10.0.8.0/24) |
| Logs | TCP 3100 (all subnets) | Nenhum |
| Gestão de Rede | TCP 10050 (10.0.5.0/24) | TCP 3100 (10.0.8.0/24) |

- **GUI**: Networking &gt; Security Lists &gt; Add Rules

## 3. Servidores e Funções

- **Total de VMs**: 45 (15 A1.Flex, 30 E2.1.Micro, 3 por conta).
- **Free Tier por conta**: 1 A1.Flex (4 OCPUs, 24 GB RAM), 2 E2.1.Micro (1 OCPU, 1 GB RAM), 200 GB Block Volume.

| Conta | Subnet CIDR | VMs | Função | Endpoint |
| --- | --- | --- | --- | --- |
| EU-FE-01 | 10.0.1.0/24 | A1.Flex (React, Fastify), 2 E2.1.Micro (Redis, MinIO) | Interface Web, APIs `/api/tokens`, `/api/form` | /health |
| NA-FE-01 | 10.0.1.0/24 | A1.Flex (React, Fastify), 2 E2.1.Micro (Redis, MinIO) | Interface Web, APIs | /health |
| SA-FE-01 | 10.0.1.0/24 | A1.Flex (React, Fastify), 2 E2.1.Micro (Redis, MinIO) | Interface Web, APIs | /health |
| AS-FE-01 | 10.0.1.0/24 | A1.Flex (React, Fastify), 2 E2.1.Micro (Redis, MinIO) | Interface Web, APIs | /health |
| AU-FE-01 | 10.0.1.0/24 | A1.Flex (React, Fastify), 2 E2.1.Micro (Redis, MinIO) | Interface Web, APIs | /health |
| EU-BE-01 | 10.0.2.0/24 | A1.Flex (APIs, PostgreSQL), 2 E2.1.Micro (Redis, MinIO) | APIs `/api/create`, `/api/buy`, DB | /health |
| NA-BE-01 | 10.0.2.0/24 | A1.Flex (APIs, PostgreSQL), 2 E2.1.Micro (Redis, MinIO) | APIs, DB | /health |
| EU-SOL-01 | 10.0.3.0/24 | A1.Flex (nó Solana), 2 E2.1.Micro (RPC, Redis) | Transações Solana (\~35.000 tx/h) | /rpc |
| AS-SOL-01 | 10.0.3.0/24 | A1.Flex (nó Solana), 2 E2.1.Micro (RPC, Redis) | Transações Solana (\~35.000 tx/h) | /rpc |
| EU-SEC-01 | 10.0.4.0/24 | A1.Flex (Vault, Suricata), 2 E2.1.Micro (MinIO, livre) | Chaves, segurança | /status |
| EU-MON-01 | 10.0.5.0/24 | A1.Flex (Prometheus, Grafana), 2 E2.1.Micro (Prometheus, livre) | Métricas, dashboards | /metrics |
| EU-MGMT-01 | 10.0.6.0/24 | A1.Flex (Ansible, bots), 2 E2.1.Micro (Redis, MinIO) | Automação, Telegram/Discord | /admin |
| EU-FAIL-01 | 10.0.7.0/24 | A1.Flex (HAProxy), 2 E2.1.Micro (Redis, livre) | Failover Helius (\~5000 tx/h) | /failover/health |
| EU-LOG-01 | 10.0.8.0/24 | A1.Flex (Loki), 2 E2.1.Micro (MinIO, livre) | Logs centralizados, File Storage | /logs |
| EU-NET-01 | 10.0.9.0/24 | A1.Flex (Zabbix, UFW), 2 E2.1.Micro (Redis, MinIO) | Monitoramento de rede, firewall | /network |

## 4. Configuração de Load Balancers

### Flexible Load Balancers (15)

- **Exemplo**: EU-FE-01
- **GUI**: Networking &gt; Load Balancers &gt; Create Load Balancer
- **Configuração**:
  - Nome: `EU-FE-LB-Flexible`
  - Tipo: Flexible (10 Mbps)
  - Subnet: `10.0.1.0/24` (pública)
  - Backend Set: A1.Flex (60%), E2.1.Micro 1 (20%), E2.1.Micro 2 (20%)
  - Health Check: HTTP `/health`, 10s intervalo, 5s timeout, 3 retries
  - Listener: HTTP 80
- **Contas e Endpoints**:

| Conta | Subnet CIDR | Endpoint |
| --- | --- | --- |
| EU-FE-01 | 10.0.1.0/24 | /health |
| NA-FE-01 | 10.0.1.0/24 | /health |
| SA-FE-01 | 10.0.1.0/24 | /health |
| AS-FE-01 | 10.0.1.0/24 | /health |
| AU-FE-01 | 10.0.1.0/24 | /health |
| EU-BE-01 | 10.0.2.0/24 | /health |
| NA-BE-01 | 10.0.2.0/24 | /health |
| EU-SOL-01 | 10.0.3.0/24 | /health |
| AS-SOL-01 | 10.0.3.0/24 | /health |
| EU-SEC-01 | 10.0.4.0/24 | /status |
| EU-MON-01 | 10.0.5.0/24 | /metrics |
| EU-MGMT-01 | 10.0.6.0/24 | /admin |
| EU-FAIL-01 | 10.0.7.0/24 | /failover/health |
| EU-LOG-01 | 10.0.8.0/24 | /logs |
| EU-NET-01 | 10.0.9.0/24 | /network |

### Network Load Balancers (3)

- **Exemplo**: EU-SOL-01
- **GUI**: Networking &gt; Load Balancers &gt; Create Load Balancer
- **Configuração**:
  - Nome: `EU-SOL-LB-Network`
  - Tipo: Network
  - Subnet: `10.0.3.0/24` (pública)
  - Backend Set: A1.Flex, E2.1.Micro 1 (Least Connections)
  - Health Check: TCP `/rpc`, 10s intervalo, 5s timeout, 3 retries
  - Listener: TCP 8899
- **Contas e Endpoints**:

| Conta | Subnet CIDR | Endpoint |
| --- | --- | --- |
| EU-SOL-01 | 10.0.3.0/24 | /rpc |
| AS-SOL-01 | 10.0.3.0/24 | /rpc |
| EU-FAIL-01 | 10.0.7.0/24 | /failover/health |

## 5. Gerenciamento de Logs

- **Frontend (10.0.1.0/24)**:
  - **Geração**: A1.Flex (Fastify, JSON logs, ex.: `{"msg":"GET /api/tokens 200"}`), E2.1.Micro (Redis, cache logs).
  - **Coleta**: Promtail em cada VM envia logs via TCP 3100 para Loki (`10.0.8.10`).
  - **Configuração**:
    - Arquivo: `/etc/promtail/config.yml`

    ```yaml
    clients:
      - url: http://10.0.8.10:3100/loki/api/v1/push
    scrape_configs:
      - job_name: frontend
        static_configs:
          - targets: [localhost]
            labels:
              job: frontend
              host: eu-fe-01
    ```
    - Gerenciado por Ansible (EU-MGMT-01).
- **Logs (EU-LOG-01, 10.0.8.0/24)**:
  - **Armazenamento**: Loki em A1.Flex usa File Storage (400 GB, \~294 GB logs, 7 dias, \~35 GB para 5 Frontend).
  - **Backup**: MinIO em E2.1.Micro (50 GB, logs críticos, ex.: erros HTTP 500).
  - **GUI**: Compute &gt; File Storage &gt; Create File System (400 GB, montado em `/mnt/logs`).
  - **Acesso**: Grafana (EU-MON-01, `10.0.5.0/24`) consulta logs via `/logs` (Flexible Load Balancer, 2FA).
- **Security List**:
  - `10.0.1.0/24`: Egress TCP 3100 para `10.0.8.0/24`.
  - `10.0.8.0/24`: Ingress TCP 3100 de todas subnets.

## 6. Integração com Cloudflare

- **GeoDNS**: Roteia para Load Balancers regionais (ex.: `eu-fe.blitzhub.sol` → EU-FE-01).
- **Registros A**: IPs dos Flexible Load Balancers.
- **WAF**: 5 regras (XSS, SQLi).
- **Zero Trust**: 2FA para `/status`, `/metrics`, `/admin`, `/failover`, `/logs`, `/network`.

## 7. Monitoramento

- **Prometheus** (EU-MON-01): Métricas (`load_balancer_requests_total`, `load_balancer_latency_seconds`).
- **Zabbix** (EU-NET-01): Monitoramento de tráfego.
- **Grafana**: Dashboards por região, integração com Loki para logs.
- **Alertas**: Latência &gt;5ms, erros HTTP &gt;1%.

## 8. Segurança

- **Subnets Privadas**: Segurança, Monitoramento, Gerenciamento, Gestão de Rede.
- **Security Lists**: Regras mínimas (ex.: TCP 8200 apenas de `10.0.6.0/24` para Segurança).
- **Cloudflare**: WAF (5 regras), Zero Trust (2FA).
- **Vault** (EU-SEC-01): Gerencia chaves.
- **Suricata** (EU-SEC-01): Detecção de intrusão.

## 9. Configuração via GUI

### Passo 1: Criar VCN

- **Acesse**: Oracle Cloud &gt; Networking &gt; Virtual Cloud Networks
- **Conta**: EU-NET-01
- **Criar**:
  - Nome: BlitzHubVCN
  - CIDR: `10.0.0.0/16`
  - Compartment: Rede

### Passo 2: Criar Subnets

- **Acesse**: Networking &gt; Subnets
- **Criar Subnets**:
  - Frontend: `10.0.1.0/24`, pública, Internet Gateway
  - Segurança: `10.0.4.0/24`, privada, NAT Gateway
  - (Repita para todas, seção 2)

### Passo 3: Configurar Security Lists

- **Acesse**: Networking &gt; Security Lists
- **Criar Security List por subnet**:
  - Exemplo (Frontend):
    - Ingress: TCP 80, 443 (Cloudflare IPs)
    - Egress: TCP 3000 (10.0.2.0/24), 8899 (10.0.3.0/24), 3100 (10.0.8.0/24)
  - Exemplo (Logs):
    - Ingress: TCP 3100 (all subnets)
    - Egress: Nenhum

### Passo 4: Migrar VMs

- **Para cada conta** (ex.: EU-FE-01):
  - Acesse: Compute &gt; Instances
  - Mover A1.Flex, E2.1.Micro para subnet correspondente (ex.: `10.0.1.0/24`)
  - Atualizar IPs privados (ex.: `10.0.1.10` para EU-FE-A1-01)

### Passo 5: Configurar Logs

- **Frontend**:
  - Instalar Promtail em A1.Flex/E2.1.Micro (via Ansible, EU-MGMT-01)
  - Configurar: `/etc/promtail/config.yml` (seção 5)
- **EU-LOG-01**:
  - Configurar Loki em A1.Flex, File Storage (400 GB) em `/mnt/logs`
  - MinIO em E2.1.Micro (50 GB)

### Passo 6: Configurar Load Balancers

- **Acesse**: Networking &gt; Load Balancers
- Criar 15 Flexible e 3 Network Load Balancers (seção 4)

### Passo 7: Testar

- Verificar endpoints: `/health`, `/rpc`, `/logs`, `/network`
- Monitorar latência (Zabbix, Prometheus)
- Testar logs no Grafana (ex.: `{job="frontend"} |= "error"`)

## 10. Próximos Passos (5 dias)

- **Dia 1**: Criar VCN e subnets em EU-NET-01
- **Dia 2**: Configurar Security Lists, Internet/NAT Gateways
- **Dia 3**: Migrar VMs das 15 contas para subnets
- **Dia 4**: Configurar Promtail/Loki e Load Balancers
- **Dia 5**: Testar comunicação, logs, latência, segurança
