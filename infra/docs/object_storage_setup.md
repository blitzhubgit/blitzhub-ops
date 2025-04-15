# Configuração do Object Storage

Este documento detalha a configuração do **Object Storage** (20 GB por conta) e a criação dos buckets `AssetsBlitzHubXX` e `LogsBlitzHubXX` para todas as 15 contas Oracle Cloud Free Tier.

## 1. Visão Geral

- **Total de Contas**: 15.
- **Por Conta**:
  - 20 GB de Object Storage.
  - 2 Buckets:
    - `AssetsBlitzHubXX`: Armazenamento de assets estáticos (JS, CSS, imagens).
    - `LogsBlitzHubXX`: Armazenamento de logs (compressão gzip, ~50% redução).
- **Total de Buckets**: 30 (15 Assets + 15 Logs).

## 2. Configuração do Object Storage (ex.: Conta EU-FE-01)

1. **Acesse o Painel da Oracle Cloud**:
   - Faça login na conta EU-FE-01 (`eufe01@klytic.com`).
   - Vá para **Storage > Buckets**.

2. **Criar o Bucket `AssetsBlitzHubEU`**:
   - Clique em "Create Bucket".
   - **Nome**: `AssetsBlitzHubEU`.
   - **Tipo de Armazenamento**: Standard.
   - **Visibilidade**: Público (para assets estáticos).
   - **Habilitar Compressão**: Ative (gzip, ~50% redução).

3. **Criar o Bucket `LogsBlitzHubEU`**:
   - Clique em "Create Bucket".
   - **Nome**: `LogsBlitzHubEU`.
   - **Tipo de Armazenamento**: Standard.
   - **Visibilidade**: Privado (logs sensíveis).
   - **Habilitar Compressão**: Ative (gzip).

4. **Configurar Políticas de Retenção**:
   - Para `LogsBlitzHubEU`:
     - Rotação semanal, retenção de 30 dias.
     - Crie uma política de ciclo de vida:
       - Nome: `LogsRetention`.
       - Regra: "Delete objects older than 30 days".
       - Aplique ao bucket `LogsBlitzHubEU`.

5. **Configurar Acesso**:
   - Para `AssetsBlitzHubEU`:
     - Gere uma URL pública para acesso:
       - Exemplo: `https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/<namespace>/b/AssetsBlitzHubEU/o/`.
   - Para `LogsBlitzHubEU`:
     - Configure autenticação via API Key (consulte `ansible_setup.md` para uso com OCI CLI).

## 3. Repetir para Todas as Contas

Repita o processo para todas as 15 contas, criando os buckets conforme a tabela abaixo:

| Conta        | Bucket de Assets          | Bucket de Logs          | Região        |
|--------------|---------------------------|-------------------------|---------------|
| EU-FE-01     | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| NA-FE-01     | `AssetsBlitzHubNA`        | `LogsBlitzHubNA`        | Ashburn       |
| SA-FE-01     | `AssetsBlitzHubSA`        | `LogsBlitzHubSA`        | São Paulo     |
| AF-FE-01     | `AssetsBlitzHubAF`        | `LogsBlitzHubAF`        | Johannesburg  |
| AS-FE-01     | `AssetsBlitzHubAS`        | `LogsBlitzHubAS`        | Singapore     |
| AU-FE-01     | `AssetsBlitzHubAU`        | `LogsBlitzHubAU`        | Sydney        |
| ME-FE-01     | `AssetsBlitzHubME`        | `LogsBlitzHubME`        | Dubai         |
| EU-BE-01     | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| NA-BE-01     | `AssetsBlitzHubNA`        | `LogsBlitzHubNA`        | Ashburn       |
| EU-SEC-01    | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| EU-NET-01    | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| EU-MON-01    | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| EU-SOL-01    | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |
| AS-SOL-01    | `AssetsBlitzHubAS`        | `LogsBlitzHubAS`        | Singapore     |
| EU-MGMT-01   | `AssetsBlitzHubEU`        | `LogsBlitzHubEU`        | Frankfurt     |

**Nota**: Os buckets de assets e logs em regiões como Frankfurt (EU) são compartilhados entre contas na mesma região para otimizar o uso de espaço.

## 4. Integração com Cloudflare

- **Assets**:
  - Configure o Cloudflare para cachear assets estáticos:
    - Cache Rule: `Cache Everything` para URLs como `https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/<namespace>/b/AssetsBlitzHubEU/o/*`.
    - `max-age=604800` (7 dias).
    - Compressão: Brotli (~20% menos banda).

- **Logs**:
  - Logs serão exportados para Loki (EU-MON-01), mas backups no Object Storage são acessados via OCI CLI ou scripts Ansible.

## 5. Monitoramento

- **Prometheus**:
  - `object_storage_used_bytes{bucket="AssetsBlitzHubEU"}`.
  - `object_storage_used_bytes{bucket="LogsBlitzHubEU"}`.

- **Grafana**:
  - Dashboard: "Object Storage Usage".

- **Alertas**:
  - `object_storage_used_bytes > 18000000000` (90% de 20 GB).

## 6. Próximos Passos

- Teste o upload de assets:
  - `oci os object put --bucket-name AssetsBlitzHubEU --file app.js`.
- Configure playbooks Ansible para automatizar o upload de logs (consulte `ansible_setup.md`).
