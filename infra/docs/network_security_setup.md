# Configuração de Security Lists e NSGs

Este documento detalha a configuração das **Security Lists** e **Network Security Groups (NSGs)** para todas as 15 contas Oracle Cloud Free Tier.

## 1. Visão Geral

- **Security Lists**:
  - Regras gerais de Ingress e Egress para cada subnet.
  - Aplicadas a todas as VMs em uma subnet.
- **NSGs**:
  - Regras específicas para cada tipo de serviço (Frontend, Backend, Solana, Segurança).
  - Aplicadas a VMs específicas.

## 2. Configuração das Security Lists (ex.: Conta EU-FE-01)

1. **Acesse o Painel da Oracle Cloud**:
   - Faça login na conta EU-FE-01 (`eufe01@klytic.com`).
   - Vá para **Networking > Virtual Cloud Networks**.
   - Selecione a VCN `BlitzHubVCN`.

2. **Configurar a Security List**:
   - Vá para "Security Lists" e selecione a Security List associada à subnet `Subnet-EU-FE-01`.
   - **Nome**: `SecurityList-EU-FE-01`.
   - **Regras de Ingress**:
     - TCP 80 (HTTP).
     - TCP 443 (HTTPS).
     - TCP 3000 (Fastify).
   - **Regras de Egress**:
     - Tudo permitido.

3. **Aplicar a Security List**:
   - Associe a Security List à subnet `Subnet-EU-FE-01`.

## 3. Configuração dos NSGs (ex.: Conta EU-FE-01)

1. **Criar o NSG**:
   - Vá para **Networking > Network Security Groups**.
   - Clique em "Create Network Security Group".
   - **Nome**: `NSG-EU-FE-01`.
   - **Regras de Ingress**:
     - TCP 80.
     - TCP 443.
   - **Regras de Egress**:
     - Tudo permitido.

2. **Associar VMs ao NSG**:
   - Adicione as VMs `EU-FE-A1-01`, `EU-FE-E2-01`, e `EU-FE-E2-02` ao NSG `NSG-EU-FE-01`.

## 4. Repetir para Todas as Contas

Configure Security Lists e NSGs para todas as 15 contas conforme a tabela abaixo:

| Conta        | Security List          | NSG              | Regras de Ingress (NSG)       |
|--------------|------------------------|------------------|-------------------------------|
| EU-FE-01     | SecurityList-EU-FE-01  | NSG-EU-FE-01     | TCP 80, 443                   |
| NA-FE-01     | SecurityList-NA-FE-01  | NSG-NA-FE-01     | TCP 80, 443                   |
| SA-FE-01     | SecurityList-SA-FE-01  | NSG-SA-FE-01     | TCP 80, 443                   |
| AF-FE-01     | SecurityList-AF-FE-01  | NSG-AF-FE-01     | TCP 80, 443                   |
| AS-FE-01     | SecurityList-AS-FE-01  | NSG-AS-FE-01     | TCP 80, 443                   |
| AU-FE-01     | SecurityList-AU-FE-01  | NSG-AU-FE-01     | TCP 80, 443                   |
| ME-FE-01     | SecurityList-ME-FE-01  | NSG-ME-FE-01     | TCP 80, 443                   |
| EU-BE-01     | SecurityList-EU-BE-01  | NSG-EU-BE-01     | TCP 3000, 6379, 5672          |
| NA-BE-01     | SecurityList-NA-BE-01  | NSG-NA-BE-01     | TCP 3000, 6379, 5672          |
| EU-SEC-01    | SecurityList-EU-SEC-01 | NSG-EU-SEC-01    | TCP 8200                      |
| EU-NET-01    | SecurityList-EU-NET-01 | NSG-EU-NET-01    | TCP 80, 443                   |
| EU-MON-01    | SecurityList-EU-MON-01 | NSG-EU-MON-01    | TCP 3000                      |
| EU-SOL-01    | SecurityList-EU-SOL-01 | NSG-EU-SOL-01    | TCP 8899                      |
| AS-SOL-01    | SecurityList-AS-SOL-01 | NSG-AS-SOL-01    | TCP 8899                      |
| EU-MGMT-01   | SecurityList-EU-MGMT-01| NSG-EU-MGMT-01   | TCP 80, 443                   |

## 5. Monitoramento

- **Prometheus**:
  - `network_security_violations_total{nsg="NSG-EU-FE-01"}`.

- **Grafana**:
  - Dashboard: "Network Security".

- **Alertas**:
  - `network_security_violations_total > 10`.

## 6. Próximos Passos

- Teste as regras:
  - `curl http://10.0.1.11:80` (deve funcionar).
  - `curl http://10.0.1.11:8080` (deve falhar).
- Configure playbooks Ansible para automatizar a criação de regras (consulte `ansible_setup.md`).
