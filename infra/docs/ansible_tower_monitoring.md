# Monitoramento de Playbooks no Ansible Tower

Este documento descreve como monitorar a execução dos playbooks no Ansible Tower, verificar se os jobs foram bem-sucedidos, e configurar notificações para alertas de sucesso ou falha. O Ansible Tower está instalado na VM `EU-MGMT-A1-01` e gerencia os playbooks do projeto BlitzHub.

## 1. Visão Geral

O Ansible Tower oferece uma interface gráfica para:
- Executar playbooks (via Job Templates).
- Monitorar a execução em tempo real.
- Verificar logs detalhados para identificar erros.
- Configurar notificações para alertas de sucesso ou falha.

Os playbooks do projeto BlitzHub (como `setup_network.yml`, `setup_vm.yml`, `setup_load_balancer.yml`, etc.) foram configurados como Job Templates no Ansible Tower, conforme descrito em `ansible_setup.md`.

## 2. Acessar o Ansible Tower

1. **Conecte-se ao Ansible Tower**:
   - Abra um navegador e acesse:
     ```
     https://<IP_PÚBLICO_DA_VM_EU-MGMT-A1-01>
     ```
   - Usuário: `admin`
   - Senha: `BlitzHub2025!` (definida durante a instalação em `ansible_setup.md`).

2. Faça login para acessar o dashboard principal.

## 3. Executar e Monitorar um Playbook

### 3.1. Iniciar a Execução de um Playbook
1. No menu lateral, vá para **Templates**.
2. Localize o Job Template correspondente ao playbook que deseja executar:
   - Exemplo: `Setup Network` (para `setup_network.yml`).
   - Exemplo: `Setup VMs` (para `setup_vm.yml`).
3. Clique no ícone de "Launch" (um foguete) ao lado do Job Template para iniciar a execução.

### 3.2. Acompanhar a Execução em Tempo Real
1. Após iniciar o Job Template, você será redirecionado para a página de **Jobs** (ou pode acessá-la manualmente no menu lateral).
2. Clique no job que está em execução (ex.: `Setup Network #123`).
3. A interface mostrará:
   - **Status do Job**:
     - 🟢 **Successful**: Todas as tarefas foram concluídas com sucesso.
     - 🔴 **Failed**: Uma ou mais tarefas falharam.
     - 🟡 **Running**: O job ainda está em execução.
   - **Output Detalhado**:
     - Um log em tempo real de cada tarefa executada no playbook.
     - Exemplo:
       ```
       TASK [Instalar o OCI CLI] ... ok
       TASK [Criar a VCN BlitzHubVCN] ... ok
       TASK [Criar Subnets] ... ok
       ```
   - **Hosts Impactados**:
     - Lista de hosts (ex.: `eu-net-01`) e o status de cada um.
   - **Erros e Detalhes**:
     - Se uma tarefa falhar, o erro será exibido.
     - Exemplo:
       ```
       TASK [Criar a VCN BlitzHubVCN] ... failed
       fatal: [eu-net-01]: FAILED! => {"changed": true, "cmd": "oci network vcn create ...", "msg": "OCI CLI falhou: credenciais inválidas"}
       ```

### 3.3. Verificar o Resultado da Execução
1. Após a execução, o status final do job será exibido:
   - **Successful**: Todas as tarefas foram concluídas sem erros.
   - **Failed**: Pelo menos uma tarefa falhou. Clique no job para ver o log e identificar o erro.
2. Para analisar os logs:
   - Role a página para baixo para ver o log completo.
   - Use a barra de pesquisa para encontrar tarefas específicas ou erros (ex.: digite "failed" para localizar falhas).
3. Para salvar os logs:
   - Clique no botão "Download Output" (geralmente um ícone de download) para baixar o log completo em formato de texto.

## 4. Configurar Notificações para Alertas

Você pode configurar o Ansible Tower para enviar notificações (ex.: e-mail ou mensagem no Slack) quando um job for concluído, seja com sucesso ou falha.

### 4.1. Criar uma Notificação
1. No menu lateral, vá para **Notifications**.
2. Clique no botão "+" para adicionar uma nova notificação.
3. Escolha o tipo de notificação:
   - **Email**: Enviar um e-mail.
   - **Slack**: Enviar uma mensagem para um canal do Slack.
   - Outros: Webhook, Microsoft Teams, etc.
4. Exemplo de configuração para e-mail:
   - **Nome**: `BlitzHub Job Alerts`
   - **Tipo**: Email
   - **Servidor SMTP**:
     - Host: `smtp.gmail.com`
     - Porta: `587`
     - Usuário: `seuemail@gmail.com`
     - Senha: `sua-senha-de-app` (use uma senha de aplicativo se for Gmail)
   - **Destinatário**: `seuemail@exemplo.com`
   - **Assunto**: `Ansible Tower: Job {{ job.name }} - {{ job.status }}`
   - **Mensagem**:
     ```
     Job: {{ job.name }}
     Status: {{ job.status }}
     Iniciado: {{ job.started }}
     Finalizado: {{ job.finished }}
     Detalhes: {{ job.url }}
     ```
5. Salve a notificação.

### 4.2. Associar a Notificação a um Job Template
1. Volte para **Templates** e selecione o Job Template (ex.: `Setup Network`).
2. Vá para a aba **Notifications**.
3. Adicione a notificação criada:
   - **Start**: (Opcional) Enviar notificação quando o job iniciar.
   - **Success**: Enviar notificação se o job for bem-sucedido.
   - **Failure**: Enviar notificação se o job falhar.
4. Salve as alterações.
5. Agora, sempre que o Job Template for executado, você receberá um e-mail com o status do job.

## 5. Validação Pós-Execução

Além de monitorar no Ansible Tower, você pode validar se os recursos foram configurados corretamente com testes manuais.

### 5.1. Testes Manuais
Execute os seguintes comandos para verificar os recursos criados pelos playbooks:
- **Load Balancer**:
  ```bash
  curl http://eu-fe.blitzhub.sol/health
  ```
  - Esperado: Resposta HTTP 200 ou `{"status":"ok"}`.
- **Object Storage**:
  ```bash
  oci os object get --bucket-name AssetsBlitzHubEU --name app.js
  ```
  - Esperado: O objeto é listado ou baixado.
- **Banco de Dados**:
  ```bash
  sqlplus blitzhub_app@TokensDBEUFE01_high
  ```
  - Esperado: Conexão bem-sucedida. Execute `SELECT * FROM tokens;` para verificar tabelas.

### 5.2. Adicionar Validações Automáticas (Opcional)
Você pode adicionar tarefas nos playbooks para validar automaticamente os recursos criados. Exemplo para o `setup_load_balancer.yml`:
```yaml
- name: Testar o Flexible Load Balancer
  ansible.builtin.uri:
    url: "http://{{ inventory_hostname | replace('-', '.') }}.blitzhub.sol/health"
    method: GET
    status_code: 200
  register: lb_test
  retries: 3
  delay: 10
  until: lb_test.status == 200
  failed_when: lb_test.status != 200
```
- Essa tarefa verifica se o Load Balancer está respondendo corretamente. Se falhar, o erro será registrado no Ansible Tower.

## 6. Monitoramento Avançado (Futuro)

Para monitoramento mais robusto, configure o **Prometheus** e o **Grafana** na conta EU-MON-01:
1. Instale o Prometheus e Grafana na VM `EU-MON-A1-01`:
   ```bash
   sudo apt update
   sudo apt install -y prometheus grafana
   ```
2. Configure o Prometheus para coletar métricas do Ansible Tower e das VMs.
3. Use o Grafana para criar dashboards e configurar alertas (ex.: alertar se um job falhar).

Consulte `README.md` para mais detalhes sobre o monitoramento com Prometheus e Grafana.

## 7. Próximos Passos

- Execute os playbooks no Ansible Tower e monitore os logs na interface gráfica.
- Configure notificações para receber alertas sobre o status dos jobs.
- Valide os recursos criados com os testes manuais descritos acima.
- (Opcional) Adicione validações automáticas aos playbooks para verificar o sucesso das configurações.
- Configure o Prometheus e Grafana para monitoramento contínuo da infraestrutura.
