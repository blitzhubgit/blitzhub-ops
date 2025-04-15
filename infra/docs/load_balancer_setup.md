# Configuração dos Load Balancers

Este documento detalha a configuração dos **Flexible Load Balancers** (10 Mbps) e **Network Load Balancers** para todas as 15 contas Oracle Cloud Free Tier do projeto BlitzHub.

## 1. Visão Geral

- **Total de Contas**: 15.
- **Por Conta**:
  - 1 **Flexible Load Balancer**: 10 Mbps, para balanceamento de tráfego HTTP/HTTPS.
  - 1 **Network Load Balancer**: Para WebSocket e tráfego de baixa latência.
- **Total de Load Balancers**: 30 (15 Flexible + 15 Network).

## 2. Configuração do Flexible Load Balancer

### Passo a Passo (ex.: Conta EU-FE-01)

1. **Acesse o Painel da Oracle Cloud**:
   - Faça login na conta EU-FE-01 (`eufe01@klytic.com`).
   - Vá para **Networking > Load Balancers**.

2. **Criar o Flexible Load Balancer**:
   - Clique em "Create Load Balancer".
   - **Nome**: `EU-FE-LB-Flexible`.
   - **Tipo**: Flexible Load Balancer.
   - **Banda**: 10 Mbps.
   - **Visibilidade**: Público.
   - **VCN**: Selecione a VCN `BlitzHubVCN` (CIDR `10.0.0.0/16`).
   - **Subnet**: Selecione a subnet `Subnet-EU-FE-01` (`10.0.1.0/24`).

3. **Configurar Backend Set**:
   - **Nome**: `EU-FE-BackendSet`.
   - **Política de Balanceamento**: Weighted Round Robin.
   - **Backends**:
     - Adicione as 3 VMs da conta:
       - `EU-FE-A1-01`: Peso 60%.
       - `EU-FE-E2-01`: Peso 20%.
       - `EU-FE-E2-02`: Peso 20%.
   - **Health Check**:
     - Protocolo: HTTP.
     - Caminho: `/health`.
     - Intervalo: 10s.
     - Timeout: 5s.
     - Retries: 3.

4. **Configurar Listener**:
   - **Protocolo**: HTTP.
   - **Porta**: 80.
   - **Backend Set**: `EU-FE-BackendSet`.

5. **Configurar Segurança**:
   - **Security List**: Associe a Security List com regras de Ingress (TCP 80, 443).

6. **Concluir**:
   - Clique em "Create Load Balancer".
   - Anote o IP público do Load Balancer (ex.: `<LB_IP_PÚBLICO_1>`).

### Repetir para Todas as Contas

Repita o processo para todas as 15 contas, ajustando os nomes e subnets conforme a tabela abaixo:

| Conta        | Load Balancer         | Subnet CIDR      | Backends (Pesos)        |
|--------------|-----------------------|------------------|-------------------------|
| EU-FE-01     | EU-FE-LB-Flexible     | 10.0.1.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| NA-FE-01     | NA-FE-LB-Flexible     | 10.1.2.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| SA-FE-01     | SA-FE-LB-Flexible     | 10.2.3.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| AF-FE-01     | AF-FE-LB-Flexible     | 10.3.4.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| AS-FE-01     | AS-FE-LB-Flexible     | 10.4.5.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| AU-FE-01     | AU-FE-LB-Flexible     | 10.5.6.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| ME-FE-01     | ME-FE-LB-Flexible     | 10.6.7.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| EU-BE-01     | EU-BE-LB-Flexible     | 10.0.8.0/24      | A1: 80%, E2-01: 10%, E2-02: 10% |
| NA-BE-01     | NA-BE-LB-Flexible     | 10.1.8.0/24      | A1: 80%, E2-01: 10%, E2-02: 10% |
| EU-SEC-01    | EU-SEC-LB-Flexible    | 10.0.9.0/24      | A1: 60%, E2-01: 20%, E2-02: 20% |
| EU-NET-01    | EU-NET-LB-Flexible    | 10.0.10.0/24     | A1: 60%, E2-01: 20%, E2-02: 20% |
| EU-MON-01    | EU-MON-LB-Flexible    | 10.0.11.0/24     | A1: 60%, E2-01: 20%, E2-02: 20% |
| EU-SOL-01    | EU-SOL-LB-Flexible    | 10.0.12.0/24     | A1: 60%, E2-01: 20%, E2-02: 20% |
| AS-SOL-01    | AS-SOL-LB-Flexible    | 10.4.12.0/24     | A1: 60%, E2-01: 20%, E2-02: 20% |
| EU-MGMT-01   | EU-MGMT-LB-Flexible   | 10.0.13.0/24     | A1: 60%, E2-01: 20%, E2-02: 20% |

## 3. Configuração do Network Load Balancer

### Passo a Passo (ex.: Conta EU-FE-01)

1. **Acesse o Painel da Oracle Cloud**:
   - Vá para **Networking > Load Balancers**.

2. **Criar o Network Load Balancer**:
   - Clique em "Create Load Balancer".
   - **Nome**: `EU-FE-LB-Network`.
   - **Tipo**: Network Load Balancer.
   - **Visibilidade**: Público.
   - **VCN**: `BlitzHubVCN`.
   - **Subnet**: `Subnet-EU-FE-01` (`10.0.1.0/24`).

3. **Configurar Backend Set**:
   - **Nome**: `EU-FE-WebSocketSet`.
   - **Política de Balanceamento**: Least Connections.
   - **Backends**:
     - Adicione as 3 VMs:
       - `EU-FE-A1-01`.
       - `EU-FE-E2-01`.
       - `EU-FE-E2-02`.
   - **Health Check**:
     - Protocolo: TCP.
     - Caminho: `/ws/health`.
     - Intervalo: 10s.
     - Timeout: 5s.
     - Retries: 3.

4. **Configurar Listener**:
   - **Protocolo**: TCP.
   - **Porta**: 443 (para WebSocket).
   - **Backend Set**: `EU-FE-WebSocketSet`.

5. **Configurar Sticky Sessions**:
   - Método: Cookie-based.
   - Nome do Cookie: `BLITZSESSION`.

6. **Concluir**:
   - Clique em "Create Load Balancer".
   - Anote o IP público do Load Balancer (ex.: `<LB_Network_IP_PÚBLICO_1>`).

### Repetir para Todas as Contas

Repita o processo para todas as 15 contas, ajustando os nomes e subnets conforme a tabela acima. O Network Load Balancer será configurado para WebSocket em todas as contas.

## 4. Integração com Cloudflare

- **GeoDNS**:
  - Configure o Cloudflare para rotear tráfego ao Load Balancer mais próximo com base na região do usuário.
  - Exemplo:
    - Usuários na Europa → `EU-FE-LB-Flexible` (`<LB_IP_PÚBLICO_1>`).
    - Usuários na América do Norte → `NA-FE-LB-Flexible`.

- **Registros DNS**:
  - Adicione registros A para cada Load Balancer:
    - `eu-fe.blitzhub.sol` → `<LB_IP_PÚBLICO_1>`.
    - `na-fe.blitzhub.sol` → `<LB_IP_PÚBLICO_2>`.
    - E assim por diante.

## 5. Monitoramento

- **Prometheus**:
  - `load_balancer_requests_total{instance="EU-FE-LB-Flexible"}`.
  - `load_balancer_latency_seconds{instance="EU-FE-LB-Network"}`.

- **Grafana**:
  - Crie dashboards para cada região (ex.: "Load Balancer EU-FE").

- **Alertas**:
  - `load_balancer_latency_seconds > 0.005` (latência > 5ms).

## 6. Próximos Passos

- Teste o balanceamento de carga simulando tráfego:
  - `curl http://eu-fe.blitzhub.sol/health`.
- Configure failover nos playbooks Ansible para ajustar pesos dinamicamente (consulte `ansible_setup.md`).
