# Configuração com Ansible Tower

Este documento detalha a configuração do Ansible Tower na VM `EU-MGMT-A1-01` e os playbooks para configurar as 45 VMs do projeto BlitzHub.

## 1. Instalar o Ansible Tower

O Ansible Tower será instalado na VM `EU-MGMT-A1-01` (conta EU-MGMT-01), que será usada para gerenciamento.

### Passos

1. Conecte-se à VM `EU-MGMT-A1-01`:

   ```bash
   ssh -i ~/.ssh/blitzhub_key ubuntu@<IP_PÚBLICO>
   ```

2. Instale as dependências:

   ```bash
   sudo apt update
   sudo apt install -y ansible python3-pip
   pip3 install ansible-tower-cli
   ```

3. Baixe e instale o Ansible Tower (versão 3.8.5 como exemplo):

   ```bash
   wget https://releases.ansible.com/ansible-tower/setup/ansible-tower-setup-3.8.5-1.tar.gz
   tar xvf ansible-tower-setup-3.8.5-1.tar.gz
   cd ansible-tower-setup-3.8.5-1
   ```

4. Edite o arquivo de inventário:

   ```bash
   nano inventory
   ```

   ```ini
   [tower]
   localhost ansible_connection=local
   
   [database]
   
   [all:vars]
   admin_password='BlitzHub2025!'
   pg_password='BlitzHub2025!'
   rabbitmq_password='BlitzHub2025!'
   ```

5. Execute o instalador:

   ```bash
   ./setup.sh
   ```

   - O processo pode levar alguns minutos. O Ansible Tower estará disponível na porta 443.

6. Acesse o Ansible Tower:

   - Abra o navegador e acesse `https://<IP_PÚBLICO>`.
   - Faça login:
     - Usuário: `admin`.
     - Senha: `BlitzHub2025!`.

## 2. Configurar o Inventário

### Passos

1. **Criar o Inventário**:

   - No Ansible Tower, vá para **Inventories** e clique em "Add Inventory".
   - Nome: `BlitzHubInventory`.
   - Salve.

2. **Adicionar Grupos e Hosts**:

   - Crie grupos para cada conta:

     - `eu-fe-01`, `na-fe-01`, ..., `eu-mgmt-01`.

   - Adicione as VMs como hosts em cada grupo. Exemplo para `eu-fe-01`:

     - Host: `EU-FE-A1-01`

       - Endereço: `<IP_PÚBLICO_1>` (consulte `vm_inventory.md`).

       - Variáveis:

         ```
         ansible_user: ubuntu
         ansible_ssh_private_key_file: /root/.ssh/blitzhub_key
         ```

     - Host: `EU-FE-E2-01`, `EU-FE-E2-02` (mesmo processo).

   - Repita para todas as 45 VMs.

3. **Copiar a Chave SSH para o Ansible Tower**:

   - Conecte-se à VM `EU-MGMT-A1-01`:

     ```bash
     sudo mkdir -p /root/.ssh
     sudo nano /root/.ssh/blitzhub_key
     ```

   - Cole o conteúdo da chave privada (`~/.ssh/blitzhub_key` do seu computador local).

   - Ajuste as permissões:

     ```bash
     sudo chmod 600 /root/.ssh/blitzhub_key
     ```

## 3. Criar Playbooks

### 3.1. Playbook: Configuração da Rede (`setup_network.yml`)

Este playbook configura a VCN na conta EU-NET-01 e o Remote VCN Peering para conectar todas as contas.

#### Conteúdo do Playbook

```yaml
- name: Configurar VCN e Remote Peering na Conta EU-NET-01
  hosts: eu-net-01
  become: yes
  vars:
    tenancy_ocid: "<TENANCY_OCID>"
    user_ocid: "<USER_OCID>"
    fingerprint: "<FINGERPRINT>"
    private_key_path: "/root/.oci/private_key.pem"
    region: "eu-frankfurt-1"
  tasks:
    - name: Instalar o OCI CLI
      shell: |
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install.sh)" -- --accept-all-defaults
      args:
        executable: /bin/bash

    - name: Configurar o OCI CLI
      copy:
        content: |
          [DEFAULT]
          user={{ user_ocid }}
          fingerprint={{ fingerprint }}
          key_file={{ private_key_path }}
          tenancy={{ tenancy_ocid }}
          region={{ region }}
        dest: /root/.oci/config
        mode: '0600'

    - name: Criar a VCN BlitzHubVCN
      shell: |
        oci network vcn create --cidr-block 10.0.0.0/16 --display-name BlitzHubVCN --compartment-id {{ tenancy_ocid }}
      register: vcn_result

    - name: Criar Subnets
      shell: |
        oci network subnet create --cidr-block {{ item.cidr }} --display-name {{ item.name }} --vcn-id {{ vcn_result.stdout | from_json | json_query('data.id') }} --compartment-id {{ tenancy_ocid }}
      loop:
        - { name: "Subnet-EU-NET-01", cidr: "10.0.10.0/24" }
        - { name: "Subnet-EU-FE-01", cidr: "10.0.1.0/24" }
        - { name: "Subnet-NA-FE-01", cidr: "10.1.2.0/24" }
        - { name: "Subnet-SA-FE-01", cidr: "10.2.3.0/24" }
        - { name: "Subnet-AF-FE-01", cidr: "10.3.4.0/24" }
        - { name: "Subnet-AS-FE-01", cidr: "10.4.5.0/24" }
        - { name: "Subnet-AU-FE-01", cidr: "10.5.6.0/24" }
        - { name: "Subnet-ME-FE-01", cidr: "10.6.7.0/24" }
        - { name: "Subnet-EU-BE-01", cidr: "10.0.8.0/24" }
        - { name: "Subnet-NA-BE-01", cidr: "10.1.8.0/24" }
        - { name: "Subnet-EU-SEC-01", cidr: "10.0.9.0/24" }
        - { name: "Subnet-EU-MON-01", cidr: "10.0.11.0/24" }
        - { name: "Subnet-EU-SOL-01", cidr: "10.0.12.0/24" }
        - { name: "Subnet-AS-SOL-01", cidr: "10.4.12.0/24" }
        - { name: "Subnet-EU-MGMT-01", cidr: "10.0.13.0/24" }
```

#### Notas

- Substitua `<TENANCY_OCID>`, `<USER_OCID>`, `<FINGERPRINT>` e configure a chave privada da API da Oracle Cloud (`private_key_path`).
- Para configurar a API Key:
  - Vá para **Identity & Security &gt; Users** na conta EU-NET-01.
  - Selecione o usuário e clique em "Add API Key".
  - Faça upload de uma chave pública ou gere uma nova.
  - Copie a chave privada para `/root/.oci/private_key.pem` na VM `EU-MGMT-A1-01`.

### 3.2. Playbook: Configuração de VCNs Locais (`setup_local_vcn.yml`)

Este playbook cria VCNs locais em todas as contas (exceto EU-NET-01) e configura o Remote VCN Peering.

#### Conteúdo do Playbook

```yaml
- name: Configurar VCN Local e Peering
  hosts: all:!eu-net-01
  become: yes
  vars:
    tenancy_ocid: "{{ lookup('env', 'TENANCY_OCID') }}"
    user_ocid: "{{ lookup('env', 'USER_OCID') }}"
    fingerprint: "{{ lookup('env', 'FINGERPRINT') }}"
    private_key_path: "/root/.oci/private_key.pem"
    region: "{{ lookup('env', 'REGION') }}"
    vcn_cidr: "{{ vcn_cidr_map[inventory_hostname] }}"
    subnet_cidr: "{{ subnet_cidr_map[inventory_hostname] }}"
    vcn_cidr_map:
      eu-fe-01: "172.16.0.0/16"
      na-fe-01: "172.17.0.0/16"
      sa-fe-01: "172.18.0.0/16"
      af-fe-01: "172.19.0.0/16"
      as-fe-01: "172.20.0.0/16"
      au-fe-01: "172.21.0.0/16"
      me-fe-01: "172.22.0.0/16"
      eu-be-01: "172.23.0.0/16"
      na-be-01: "172.24.0.0/16"
      eu-sec-01: "172.25.0.0/16"
      eu-mon-01: "172.26.0.0/16"
      eu-sol-01: "172.27.0.0/16"
      as-sol-01: "172.28.0.0/16"
      eu-mgmt-01: "172.29.0.0/16"
    subnet_cidr_map:
      eu-fe-01: "172.16.1.0/24"
      na-fe-01: "172.17.1.0/24"
      sa-fe-01: "172.18.1.0/24"
      af-fe-01: "172.19.1.0/24"
      as-fe-01: "172.20.1.0/24"
      au-fe-01: "172.21.1.0/24"
      me-fe-01: "172.22.1.0/24"
      eu-be-01: "172.23.1.0/24"
      na-be-01: "172.24.1.0/24"
      eu-sec-01: "172.25.1.0/24"
      eu-mon-01: "172.26.1.0/24"
      eu-sol-01: "172.27.1.0/24"
      as-sol-01: "172.28.1.0/24"
      eu-mgmt-01: "172.29.1.0/24"
  tasks:
    - name: Instalar o OCI CLI
      shell: |
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install.sh)" -- --accept-all-defaults
      args:
        executable: /bin/bash

    - name: Configurar o OCI CLI
      copy:
        content: |
          [DEFAULT]
          user={{ user_ocid }}
          fingerprint={{ fingerprint }}
          key_file={{ private_key_path }}
          tenancy={{ tenancy_ocid }}
          region={{ region }}
        dest: /root/.oci/config
        mode: '0600'

    - name: Criar VCN Local
      shell: |
        oci network vcn create --cidr-block {{ vcn_cidr }} --display-name LocalVCN-{{ inventory_hostname | upper }} --compartment-id {{ tenancy_ocid }}
      register: local_vcn_result

    - name: Criar Subnet Local
      shell: |
        oci network subnet create --cidr-block {{ subnet_cidr }} --display-name LocalSubnet-{{ inventory_hostname | upper }} --vcn-id {{ local_vcn_result.stdout | from_json | json_query('data.id') }} --compartment-id {{ tenancy_ocid }}
```

#### Notas

- Configure as variáveis de ambiente (`TENANCY_OCID`, `USER_OCID`, `FINGERPRINT`, `REGION`) no Ansible Tower para cada conta.
- O Remote VCN Peering requer passos manuais adicionais (como estabelecer a conexão entre LPG e RPC), que devem ser documentados separadamente ou automatizados com scripts adicionais.

### 3.3. Playbook: Configuração das VMs (`setup_vm.yml`)

Este playbook instala pacotes básicos, configura o firewall e instala serviços como Node.js, Redis, e o HashiCorp Vault (para EU-SEC-01).

#### Conteúdo do Playbook

```yaml
- name: Configurar VMs para BlitzHub
  hosts: all
  become: yes
  tasks:
    - name: Atualizar pacotes
      apt:
        update_cache: yes
        upgrade: dist

    - name: Instalar pacotes básicos
      apt:
        name: "{{ packages }}"
        state: present
      vars:
        packages:
          - curl
          - git
          - ufw

    - name: Configurar firewall (UFW)
      ufw:
        rule: allow
        port: "{{ item }}"
      loop:
        - 80
        - 443
        - 3000
        - 6379
        - 5672
        - 8899
        - 8200

    - name: Instalar Node.js
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs

    - name: Instalar Redis
      apt:
        name: redis-server
        state: present
      when: "'be' in inventory_hostname or 'mgmt' in inventory_hostname"

    - name: Configurar Redis
      lineinfile:
        path: /etc/redis/redis.conf
        regexp: '^maxmemory '
        line: 'maxmemory 4GB'
      when: "'be' in inventory_hostname or 'mgmt' in inventory_hostname"

    - name: Reiniciar Redis
      service:
        name: redis-server
        state: restarted
      when: "'be' in inventory_hostname or 'mgmt' in inventory_hostname"

- name: Configurar HashiCorp Vault na Conta EU-SEC-01
  hosts: eu-sec-01
  become: yes
  tasks:
    - name: Instalar o Vault
      shell: |
        wget https://releases.hashicorp.com/vault/1.15.6/vault_1.15.6_linux_arm64.zip
        unzip vault_1.15.6_linux_arm64.zip
        mv vault /usr/local/bin/
      args:
        creates: /usr/local/bin/vault

    - name: Criar usuário e diretórios para o Vault
      shell: |
        useradd --system --home /etc/vault.d --shell /bin/false vault
        mkdir -p /etc/vault.d
        mkdir -p /var/lib/vault
        chown vault:vault /etc/vault.d /var/lib/vault
      args:
        creates: /etc/vault.d

    - name: Configurar o Vault
      copy:
        content: |
          storage "file" {
            path = "/var/lib/vault"
          }

          listener "tcp" {
            address     = "0.0.0.0:8200"
            tls_disable = 1
          }

          api_addr = "http://{{ ansible_default_ipv4.address }}:8200"
          ui = true
        dest: /etc/vault.d/vault.hcl
        owner: vault
        group: vault
        mode: '0640'

    - name: Criar serviço Systemd para o Vault
      copy:
        content: |
          [Unit]
          Description=HashiCorp Vault
          Documentation=https://www.vaultproject.io/docs/
          Requires=network-online.target
          After=network-online.target

          [Service]
          User=vault
          Group=vault
          ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
          ExecReload=/bin/kill --signal HUP $MAINPID
          KillMode=process
          Restart=on-failure
          LimitNOFILE=65536

          [Install]
          WantedBy=multi-user.target
        dest: /etc/systemd/system/vault.service
        mode: '0644'

    - name: Iniciar o Vault
      systemd:
        name: vault
        enabled: yes
        state: started
        daemon_reload: yes
```

### 3.4. Playbook: Configuração do Banco de Dados (`setup_db.yml`)

Este playbook configura o Autonomous Database e as wallets.

#### Conteúdo do Playbook

```yaml
- name: Configurar Autonomous Database
  hosts: all:!eu-net-01:!eu-sec-01
  become: yes
  tasks:
    - name: Instalar sqlcl
      shell: |
        wget https://download.oracle.com/otn_software/java/sqldeveloper/sqlcl-latest.zip
        unzip sqlcl-latest.zip -d /opt/
      args:
        creates: /opt/sqlcl

    - name: Criar tabelas no Autonomous Database
      shell: |
        /opt/sqlcl/bin/sql {{ db_user }}/{{ db_password }}@{{ db_host }} <<EOF
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
        EOF
      vars:
        db_user: admin
        db_password: "BlitzHubDB2025!{{ inventory_hostname | upper }}"
        db_host: "{{ db_host_map[inventory_hostname] }}"
        db_host_map:
          eu-fe-01: "tokensdbeufe01_high"
          na-fe-01: "tokensdbnafe01_high"
          sa-fe-01: "tokensdbsafe01_high"
          af-fe-01: "tokensdbaffe01_high"
          as-fe-01: "tokensdbasfe01_high"
          au-fe-01: "tokensdbaufe01_high"
          me-fe-01: "tokensdbmefe01_high"
          eu-be-01: "feesdbeube01_high"
          na-be-01: "feesdbnabe01_high"
          eu-mon-01: "rewardsdbeumon01_high"
          eu-sol-01: "usersdbeusol01_high"
          as-sol-01: "usersdbassol01_high"
          eu-mgmt-01: "admindbeumgmt01_high"
```

## 4. Executar os Playbooks no Ansible Tower

1. **Criar um Projeto**:

   - No Ansible Tower, vá para **Projects** e clique em "Add".
   - Nome: `BlitzHubPlaybooks`.
   - SCM Type: Manual (ou configure um repositório Git).
   - Copie os playbooks (`setup_network.yml`, `setup_local_vcn.yml`, `setup_vm.yml`, `setup_db.yml`) para o diretório do projeto.

2. **Criar Job Templates**:

   - Vá para **Templates** e crie um Job Template para cada playbook:
     - **Setup Network**:
       - Inventory: `BlitzHubInventory`.
       - Playbook: `setup_network.yml`.
       - Limit: `eu-net-01`.
     - **Setup Local VCN**:
       - Inventory: `BlitzHubInventory`.
       - Playbook: `setup_local_vcn.yml`.
       - Limit: `all:!eu-net-01`.
     - **Setup VMs**:
       - Inventory: `BlitzHubInventory`.
       - Playbook: `setup_vm.yml`.
       - Limit: `all`.
     - **Setup Database**:
       - Inventory: `BlitzHubInventory`.
       - Playbook: `setup_db.yml`.
       - Limit: `all:!eu-net-01:!eu-sec-01`.

3. **Executar os Jobs**:

   - Execute cada Job Template na ordem acima.
   - Verifique os logs para garantir que a configuração foi concluída com sucesso.

## 5. Próximos Passos

- Teste a conectividade entre as VMs após o Remote VCN Peering.
- Configure o HashiCorp Vault manualmente (inicialização, unseal, armazenamento de segredos).
- Avance para a configuração do backend e frontend (Fastify, React, etc.).
