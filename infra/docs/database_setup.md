# Configuração do Autonomous Database

Este documento detalha a configuração do **Autonomous Database** (20 GB por conta) e os schemas para todas as 15 contas Oracle Cloud Free Tier.

## 1. Visão Geral

- **Total de Contas**: 15.
- **Por Conta**:
  - 1 Autonomous Database (20 GB).
  - Schemas específicos:
    - `TokensDB`, `FeesDB`, `RewardsDB`, `ReferralsDB`, `UsersDB`, `SecurityDB`, `AdminDB`.
- **Total de Bancos**: 15.

## 2. Configuração do Autonomous Database (ex.: Conta EU-FE-01)

1. **Acesse o Painel da Oracle Cloud**:
   - Faça login na conta EU-FE-01 (`eufe01@klytic.com`).
   - Vá para **Database > Autonomous Database**.

2. **Criar o Banco**:
   - Clique em "Create Autonomous Database".
   - **Nome**: `TokensDBEUFE01`.
   - **Tipo**: Transaction Processing.
   - **Espaço**: 20 GB.
   - **Auto-scaling**: Ativado.
   - **Acesso**: Restrito (via VCN `BlitzHubVCN`).
   - **Senha do Admin**: `BlitzHubDB2025!EUFE01`.

3. **Configurar Tabelas e Índices**:
   - Conecte-se ao banco usando SQLcl ou o console da Oracle Cloud.
   - Execute os scripts SQL para criar as tabelas:

     ```sql
     CREATE TABLE tokens (
       mint VARCHAR2(44) PRIMARY KEY,
       name VARCHAR2(64),
       symbol VARCHAR2(32),
       description VARCHAR2(128),
       twitter VARCHAR2(256),
       telegram VARCHAR2(256),
       webpage VARCHAR2(256),
       total_sold NUMBER DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       curve_type NUMBER(1) CHECK (curve_type IN (1, 2, 3)),
       market_cap NUMBER DEFAULT 0,
       graduated NUMBER(1) DEFAULT 0 CHECK (graduated IN (0, 1))
     );
     CREATE INDEX idx_created_at ON tokens(created_at);

     CREATE TABLE fees (
       fee_id VARCHAR2(36) PRIMARY KEY,
       mint VARCHAR2(44),
       wallet VARCHAR2(44),
       platform_fee NUMBER,
       gas_fee NUMBER,
       fee_type VARCHAR2(10) CHECK (fee_type IN ('no_fee', 'standard', 'premium')),
       priority VARCHAR2(10) CHECK (priority IN ('low', 'medium', 'high')),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'refunded')),
       FOREIGN KEY (mint) REFERENCES tokens(mint)
     );
     CREATE INDEX idx_mint_wallet ON fees(mint, wallet);
     ```

4. **Configurar Backup**:
   - Backup diário, retenção de 7 dias.
   - No painel do Autonomous Database, vá para "Backup" e configure:
     - Frequência: Diário.
     - Retenção: 7 dias.

5. **Configurar Segurança**:
   - Crie um usuário para a aplicação:
     ```sql
     CREATE USER blitzhub_app IDENTIFIED BY "BlitzHubApp2025!";
     GRANT SELECT, INSERT, UPDATE ON tokens TO blitzhub_app;
     GRANT SELECT, INSERT, UPDATE ON fees TO blitzhub_app;
     ```

## 3. Repetir para Todas as Contas

Repita o processo para todas as 15 contas, ajustando os nomes e schemas conforme a tabela abaixo:

| Conta        | Nome do Banco         | Schemas Principais        | Região        |
|--------------|-----------------------|---------------------------|---------------|
| EU-FE-01     | `TokensDBEUFE01`      | TokensDB, FeesDB          | Frankfurt     |
| NA-FE-01     | `TokensDBNAFE01`      | TokensDB, FeesDB          | Ashburn       |
| SA-FE-01     | `TokensDBSAFE01`      | TokensDB, FeesDB          | São Paulo     |
| AF-FE-01     | `TokensDBAFFE01`      | TokensDB, FeesDB          | Johannesburg  |
| AS-FE-01     | `TokensDBASFE01`      | TokensDB, FeesDB          | Singapore     |
| AU-FE-01     | `TokensDBAUFE01`      | TokensDB, FeesDB          | Sydney        |
| ME-FE-01     | `TokensDBMEFE01`      | TokensDB, FeesDB          | Dubai         |
| EU-BE-01     | `FeesDBEUBE01`        | FeesDB, RewardsDB         | Frankfurt     |
| NA-BE-01     | `FeesDBNABE01`        | FeesDB, RewardsDB         | Ashburn       |
| EU-SEC-01    | `SecurityDBEUSEC01`   | SecurityDB                | Frankfurt     |
| EU-NET-01    | `NetworkDBEUNET01`    | (Logs de rede)            | Frankfurt     |
| EU-MON-01    | `RewardsDBEUMON01`    | RewardsDB, ReferralsDB    | Frankfurt     |
| EU-SOL-01    | `UsersDBEUSOL01`      | UsersDB                   | Frankfurt     |
| AS-SOL-01    | `UsersDBASSOL01`      | UsersDB                   | Singapore     |
| EU-MGMT-01   | `AdminDBEUMGMT01`     | AdminDB, ReferralsDB      | Frankfurt     |

**Nota**: Algumas contas compartilham schemas (ex.: `FeesDB` é usado por várias contas). Para evitar duplicação, configure conexões entre bancos usando Database Links se necessário.

## 4. Monitoramento

- **Prometheus**:
  - `database_query_duration_seconds{instance="TokensDBEUFE01"}`.

- **Grafana**:
  - Dashboard: "Autonomous Database Performance".

- **Alertas**:
  - `database_query_duration_seconds > 0.1`.

## 5. Próximos Passos

- Teste as conexões:
  - `sqlplus blitzhub_app@TokensDBEUFE01_high`.
- Configure playbooks Ansible para automatizar a criação de tabelas (consulte `ansible_setup.md`).
