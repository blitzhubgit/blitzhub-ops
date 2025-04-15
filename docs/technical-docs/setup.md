# Setup Description

## Description
Instructions for setting up the infrastructure (VMs, database, services like Fastify, Redis), including Ansible playbooks and validations.

## How to Develop
- **Audience**: Operations team (Klytic).
- **Tone**: Technical and straightforward.
- **Format**: Markdown with commands and examples.

## Steps to Build
- Introduce setup: "Instructions for setting up BlitzHub on Oracle Cloud."
- List prerequisites: Ubuntu 22.04, Ansible, SSH keys.
- Detail VM setup: E.g., `ansible-playbook setup_vm.yml -i inventory/eu-fe-01`.
- Configure database: E.g., `CREATE TABLE tokens (...)`.
- Configure services: Fastify, Redis, Varnish, with commands (e.g., `redis-server --maxmemory 4GB`).
- Add validations: E.g., `curl http://10.0.1.10/health`.
