# Criação de VMs na Oracle Cloud

Este documento detalha a criação manual das 45 VMs (3 por conta) nas 15 contas Oracle Cloud Free Tier.

## 1. Visão Geral

- **Total de Contas**: 15.
- **VMs por Conta**: 3 (1 A1.Flex + 2 E2.1.Micro).
- **Total de VMs**: 45 (15 × 3).

## 2. Criação das VMs (ex.: Conta EU-FE-01)

1. Faça login na conta EU-FE-01 (`eufe01@klytic.com`).

2. Crie as VMs:
   - **A1.Flex (EU-FE-A1-01)**:
     - Vá para **Compute > Instances**.
     - Clique em "Create Instance".
     - **Nome**: `EU-FE-A1-01`.
     - **Image**: Ubuntu 22.04 LTS.
     - **Shape**: A1.Flex (4 OCPUs, 24 GB RAM).
     - **Storage**: 200 GB.
     - **Networking**:
       - Use a VCN padrão por enquanto (será ajustada com Ansible Tower).
       - Atribua um IP público.
     - **SSH Key**:
       - Selecione "Paste public keys".
       - Cole o conteúdo de `~/.ssh/blitzhub_key.pub` (consulte `ssh_setup.md`).
     - Clique em "Create".
   - **E2.1.Micro (EU-FE-E2-01 e EU-FE-E2-02)**:
     - Repita o processo, ajustando:
       - Nome: `EU-FE-E2-01` e `EU-FE-E2-02`.
       - Shape: E2.1.Micro (1 OCPU, 1 GB RAM).
       - Storage: 50 GB.

3. Anote os IPs públicos das VMs (encontrados na página de detalhes da instância):
   - `EU-FE-A1-01`: `<IP_PÚBLICO_1>`
   - `EU-FE-E2-01`: `<IP_PÚBLICO_2>`
   - `EU-FE-E2-02`: `<IP_PÚBLICO_3>`

## 3. Repetir para Todas as Contas

Repita o processo para todas as 15 contas, criando 3 VMs por conta (total de 45 VMs). A lista completa de IPs está documentada em `vm_inventory.md`.

## 4. Próximos Passos

- Configure o Ansible Tower para ajustar a rede (VCN, subnets, peering) e instalar os serviços necessários (consulte `ansible_setup.md`).
