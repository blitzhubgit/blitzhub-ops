# Configuração de Credenciais OCI para Ansible

Este documento descreve como extrair as credenciais necessárias da Oracle Cloud Infrastructure (OCI) para configurar o Ansible Tower e executar os playbooks do projeto BlitzHub. As credenciais incluem o **Tenancy OCID**, **User OCID**, **Fingerprint**, **Private Key**, e a **Região**.

## 1. Visão Geral

Para que os playbooks Ansible (como `setup_network.yml`, `setup_load_balancer.yml`, etc.) possam interagir com a Oracle Cloud, você precisa configurar o OCI CLI com as seguintes credenciais:

- **Tenancy OCID**: Identificador único da sua tenancy na Oracle Cloud.
- **User OCID**: Identificador único do usuário associado à conta.
- **Fingerprint**: Identificador da chave API usada para autenticação.
- **Private Key**: Chave privada gerada para autenticação via API.
- **Região**: A região associada à conta (ex.: `eu-frankfurt-1`).

Essas credenciais serão usadas pelo Ansible Tower para gerenciar recursos em todas as 15 contas Oracle Cloud Free Tier do projeto BlitzHub.

## 2. Passo a Passo para Extrair as Credenciais

### 2.1. Faça Login na Conta Oracle Cloud

1. Acesse o console da Oracle Cloud com as credenciais de uma das contas listadas em `oracle_accounts.md` (localizado em `infra/docs/`).
   - Exemplo: Para a conta EU-FE-01:
     - Email: `eufe01@klytic.com`
     - Senha: Consulte `oracle_accounts.md` ou o gerenciador de senhas.
2. Faça login em [https://cloud.oracle.com](https://cloud.oracle.com).

### 2.2. Obtenha o Tenancy OCID

1. No console da Oracle Cloud, clique no seu perfil (canto superior direito, geralmente com o nome do usuário ou tenancy).
2. Selecione **"Tenancy: <nome-da-tenancy>"**.
3. Na página de detalhes da tenancy, localize o campo **"OCID"**.
   - Copie o valor do **Tenancy OCID**.
     - Exemplo: `ocid1.tenancy.oc1..aaaaaaaaxxxxx`.
4. Anote esse valor para a conta atual (ex.: EU-FE-01).

### 2.3. Obtenha o User OCID

1. No console, clique novamente no seu perfil e selecione **"User Settings"**.
2. Na página de detalhes do usuário, localize o campo **"OCID"**.
   - Copie o valor do **User OCID**.
     - Exemplo: `ocid1.user.oc1..aaaaaaaayyyyy`.
3. Anote esse valor para a conta atual.

### 2.4. Crie uma Chave API e Obtenha o Fingerprint

1. Ainda na página de **"User Settings"**, vá para a seção **"API Keys"**.
2. Clique em **"Add API Key"**.
3. Escolha a opção **"Generate API Key Pair"**.
   - Isso gerará um par de chaves (pública e privada). Clique para baixar:
     - **Chave Pública**: `oci_api_key_public.pem`.
     - **Chave Privada**: `oci_api_key.pem`.
4. Após adicionar a chave pública no console, o **Fingerprint** será exibido.
   - Copie o valor do **Fingerprint**.
     - Exemplo: `12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef`.
5. Salve a chave privada (`oci_api_key.pem`) em um local seguro. Ela será usada pelo Ansible Tower.

### 2.5. Obtenha a Região

1. No console da Oracle Cloud, verifique a região exibida no canto superior direito.
   - Exemplo: `eu-frankfurt-1` (para contas em Frankfurt).
2. Alternativamente, consulte a tabela de contas e regiões em `oracle_accounts.md`:
   - EU-FE-01: `eu-frankfurt-1`
   - NA-FE-01: `us-ashburn-1`
   - SA-FE-01: `sa-saopaulo-1`
   - AF-FE-01: `af-johannesburg-1`
   - AS-FE-01: `ap-singapore-1`
   - AU-FE-01: `ap-sydney-1`
   - ME-FE-01: `me-dubai-1`
   - EU-BE-01: `eu-frankfurt-1`
   - NA-BE-01: `us-ashburn-1`
   - EU-SEC-01: `eu-frankfurt-1`
   - EU-NET-01: `eu-frankfurt-1`
   - EU-MON-01: `eu-frankfurt-1`
   - EU-SOL-01: `eu-frankfurt-1`
   - AS-SOL-01: `ap-singapore-1`
   - EU-MGMT-01: `eu-frankfurt-1`
3. Anote a região correspondente à conta.

### 2.6. Repita para Todas as Contas

- Repita os passos acima para cada uma das 15 contas Oracle Cloud (EU-FE-01, NA-FE-01, ..., EU-MGMT-01).
- Organize as credenciais em um formato seguro, como uma tabela no arquivo `oracle_accounts.md`, ou armazene-as no HashiCorp Vault (configurado em EU-SEC-01).

#### Exemplo de Tabela para `oracle_accounts.md`:

| Conta      | Tenancy OCID                      | User OCID                        | Fingerprint                          | Região          |
|------------|-----------------------------------|----------------------------------|--------------------------------------|-----------------|
| EU-FE-01   | ocid1.tenancy.oc1..aaaaaaaaxxxxx | ocid1.user.oc1..aaaaaaaayyyyy   | 12:34:56:78:90:ab:cd:ef:12:34:56:78 | eu-frankfurt-1  |
| NA-FE-01   | ocid1.tenancy.oc1..bbbbbbbxxxxxx | ocid1.user.oc1..bbbbbbbyyyyyy   | 23:45:67:89:01:bc:de:fg:23:45:67:89 | us-ashburn-1    |
| ...        | ...                              | ...                             | ...                                  | ...             |

**Nota**: Não inclua as chaves privadas na tabela por motivos de segurança. Armazene-as separadamente ou no Vault.

## 3. Configure as Credenciais no Ansible Tower

### 3.1. Copie a Chave Privada para o Ansible Tower

1. Conecte-se à VM onde o Ansible Tower está instalado (`EU-MGMT-A1-01`):
   ```bash
   scp -i ~/.ssh/blitzhub_key oci_api_key.pem ubuntu@<IP_PÚBLICO>:/root/.oci/private_key.pem
   ```
2. Ajuste as permissões:
   ```bash
   ssh -i ~/.ssh/blitzhub_key ubuntu@<IP_PÚBLICO>
   sudo chmod 600 /root/.oci/private_key.pem
   ```

3. Repita esse processo para cada conta, nomeando as chaves de forma distinta (ex.: `private_key_eufe01.pem`, `private_key_nafe01.pem`, etc.), ou use um único arquivo se estiver gerenciando múltiplas contas a partir de um único usuário.

### 3.2. Configure as Variáveis no Ansible Tower

1. No Ansible Tower, vá para **Inventories** e edite o inventário `BlitzHubInventory`.
2. Para cada grupo de hosts (ex.: `eu-fe-01`, `na-fe-01`), adicione as variáveis correspondentes:

   ```yaml
   tenancy_ocid: "ocid1.tenancy.oc1..aaaaaaaaxxxxx"
   user_ocid: "ocid1.user.oc1..aaaaaaaayyyyy"
   fingerprint: "12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef"
   private_key_path: "/root/.oci/private_key.pem"
   region: "eu-frankfurt-1"
   ```

3. Alternativamente, você pode passar essas variáveis ao criar um Job Template:
   - No Ansible Tower, vá para **Templates**, selecione o Job Template (ex.: `Setup Network`).
   - Em **Extra Variables**, adicione as credenciais no formato YAML acima.

### 3.3. (Opcional) Armazene as Credenciais no HashiCorp Vault

Para maior segurança, armazene as credenciais no HashiCorp Vault (configurado em EU-SEC-01) e configure os playbooks para recuperá-las dinamicamente:

1. Conecte-se ao Vault na VM `EU-SEC-A1-01`:
   ```bash
   export VAULT_ADDR="http://<VAULT_IP>:8200"
   vault login <VAULT_TOKEN>
   ```
2. Armazene as credenciais:
   ```bash
   vault kv put secret/blitzhub/eu-fe-01 tenancy_ocid="ocid1.tenancy.oc1..aaaaaaaaxxxxx" user_ocid="ocid1.user.oc1..aaaaaaaayyyyy" fingerprint="12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef" region="eu-frankfurt-1"
   ```
3. Atualize os playbooks para buscar as credenciais do Vault:
   ```yaml
   - name: Recuperar Credenciais do Vault
     ansible.builtin.set_fact:
       tenancy_ocid: "{{ lookup('hashi_vault', 'secret/blitzhub/eu-fe-01:tenancy_ocid token=<VAULT_TOKEN> url=http://<VAULT_IP>:8200') }}"
       user_ocid: "{{ lookup('hashi_vault', 'secret/blitzhub/eu-fe-01:user_ocid token=<VAULT_TOKEN> url=http://<VAULT_IP>:8200') }}"
       fingerprint: "{{ lookup('hashi_vault', 'secret/blitzhub/eu-fe-01:fingerprint token=<VAULT_TOKEN> url=http://<VAULT_IP>:8200') }}"
       region: "{{ lookup('hashi_vault', 'secret/blitzhub/eu-fe-01:region token=<VAULT_TOKEN> url=http://<VAULT_IP>:8200') }}"
   ```

## 4. Teste a Configuração

1. Execute um comando OCI CLI manualmente na VM `EU-MGMT-A1-01` para verificar a autenticação:
   ```bash
   oci iam user list
   ```
   - Se funcionar, você verá uma lista de usuários na tenancy. Caso contrário, revise as credenciais no arquivo `/root/.oci/config`.

2. Execute um playbook de teste (ex.: `setup_network.yml`) no Ansible Tower para confirmar que as credenciais estão funcionando corretamente.

## 5. Próximos Passos

- Atualize o arquivo `oracle_accounts.md` com as credenciais coletadas (exceto as chaves privadas).
- Execute os playbooks no Ansible Tower conforme descrito em `ansible_setup.md`.
- Teste a infraestrutura (ex.: `curl http://eu-fe.blitzhub.sol/health`).
