# Configuração de Contas Oracle Cloud

Este documento detalha o processo de criação dos emails e registro das 15 contas na Oracle Cloud Free Tier para o projeto BlitzHub.

## 1. Criação dos Emails

A Oracle Cloud exige emails únicos para cada conta Free Tier. Como aliases (`+`) não são aceitos para contas diferentes, criamos 15 emails distintos usando o domínio `klytic.com` (ou, alternativamente, um provedor como Gmail).

### Lista de Emails Criados

| Conta        | Email                          | Região        |
|--------------|--------------------------------|---------------|
| EU-FE-01     | `eufe01@klytic.com`           | Frankfurt     |
| NA-FE-01     | `nafe01@klytic.com`           | Ashburn       |
| SA-FE-01     | `safe01@klytic.com`           | São Paulo     |
| AF-FE-01     | `affe01@klytic.com`           | Johannesburg  |
| AS-FE-01     | `asfe01@klytic.com`           | Singapore     |
| AU-FE-01     | `aufe01@klytic.com`           | Sydney        |
| ME-FE-01     | `mefe01@klytic.com`           | Dubai         |
| EU-BE-01     | `eube01@klytic.com`           | Frankfurt     |
| NA-BE-01     | `nabe01@klytic.com`           | Ashburn       |
| EU-SEC-01    | `eusec01@klytic.com`          | Frankfurt     |
| EU-NET-01    | `eunet01@klytic.com`          | Frankfurt     |
| EU-MON-01    | `eumon01@klytic.com`          | Frankfurt     |
| EU-SOL-01    | `eusol01@klytic.com`          | Frankfurt     |
| AS-SOL-01    | `assol01@klytic.com`          | Singapore     |
| EU-MGMT-01   | `eumgmt01@klytic.com`         | Frankfurt     |

### Passos para Criar os Emails

1. Acesse o painel de controle do domínio `klytic.com` (ou use um provedor como Gmail).
2. Crie cada email da lista acima.
   - Exemplo: Para `eufe01@klytic.com`, configure uma nova conta de email no domínio.
   - Alternativa com Gmail: Crie `blitzhub.eufe01@gmail.com`, `blitzhub.nafe01@gmail.com`, etc.
3. Anote as credenciais (email e senha) de cada conta de email em um gerenciador de senhas.

## 2. Registro das Contas na Oracle Cloud

### Passo a Passo para Registrar uma Conta (ex.: EU-FE-01)

1. **Acesse o Site da Oracle Cloud**:
   - Vá para `https://www.oracle.com/cloud/free/`.
   - Clique em "Start for Free".

2. **Preencha o Formulário de Registro**:
   - Nome: "Klytic EU-FE-01".
   - Email: `eufe01@klytic.com`.
   - País/Região: Alemanha (para Frankfurt).
   - Senha: Crie uma senha forte (ex.: `BlitzHub2025!EuFe01`). Anote-a.
   - Aceite os Termos: Marque a caixa de aceitação dos termos de serviço.

3. **Verificação de Email**:
   - A Oracle enviará um email de verificação para `eufe01@klytic.com`.
   - Acesse a caixa de entrada e clique no link de verificação.

4. **Validação de Identidade**:
   - **Número de Telefone**:
     - Insira um número de telefone válido.
     - Você receberá um código SMS para verificação.
   - **Cartão de Crédito**:
     - Insira os detalhes de um cartão de crédito válido (necessário para validação, mas não será cobrado no Free Tier).
     - **Nota**: A Oracle pode limitar o número de contas por cartão. Use cartões virtuais (ex.: Privacy.com) ou peça ajuda a amigos/familiares para fornecer cartões diferentes.

5. **Escolha da Região Inicial**:
   - Escolha a região correspondente: Frankfurt (Germany Central).

6. **Conclusão do Registro**:
   - A conta será criada, e você será redirecionado para o painel da Oracle Cloud.

### Repetir para Todas as Contas

- Repita o processo para todas as 15 contas, usando os emails e regiões da tabela acima.
- As credenciais das contas estão documentadas em `oracle_accounts.md`.
