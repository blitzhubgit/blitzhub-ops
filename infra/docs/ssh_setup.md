# Configuração de Chave SSH

Este documento detalha a geração e uso de uma única chave SSH Ed25519 para todas as VMs do projeto BlitzHub.

## 1. Gerar a Chave SSH Única

1. No computador local, execute:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/blitzhub_key -C "contact@klytic.com"
   ```
   - **Opções**:
     - `-t ed25519`: Usa o algoritmo Ed25519 (mais seguro e eficiente que RSA).
     - `-f ~/.ssh/blitzhub_key`: Define o nome do arquivo (`blitzhub_key` para a chave privada, `blitzhub_key.pub` para a chave pública).
     - `-C "contact@klytic.com"`: Adiciona um comentário para identificar a chave.
   - **Senha**: Deixe em branco (pressione Enter duas vezes) ou use uma senha (ex.: `BlitzHub2025!`).

2. Verifique os arquivos gerados:
   - `~/.ssh/blitzhub_key`: Chave privada.
   - `~/.ssh/blitzhub_key.pub`: Chave pública.

3. Veja o conteúdo da chave pública (será usada ao criar as VMs):
   ```bash
   cat ~/.ssh/blitzhub_key.pub
   ```
   - Exemplo de saída:
     ```
     ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... contact@klytic.com
     ```

## 2. Uso da Chave SSH

A chave pública (`blitzhub_key.pub`) será importada manualmente ao criar cada VM na Oracle Cloud. Consulte `vm_creation.md` para detalhes.

## 3. Backup da Chave

- Faça backup da chave privada (`blitzhub_key`) em um local seguro (ex.: drive criptografado ou gerenciador de senhas).
- **Atenção**: Se a chave privada for perdida, você perderá o acesso às VMs, a menos que configure outra forma de acesso (ex.: console de emergência da Oracle Cloud).

## 4. Rotação da Chave (Planejamento)

O documento especifica rotação de chaves a cada 90 dias. Para rotacionar:

1. Gere uma nova chave:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/blitzhub_key_new -C "contact@klytic.com"
   ```

2. Adicione a nova chave às VMs usando Ansible (detalhado em `ansible_setup.md`).

3. Teste a nova chave e remova a antiga.
