# BlitzHub Infrastructure

This directory (`infra/`) contains Ansible playbooks for automating infrastructure tasks for BlitzHub, ensuring efficient setup and maintenance.

## Infrastructure Scripts

- **`setup_vm.yml`**: Playbook to set up virtual machines (e.g., EU-FE-01 on Oracle Cloud).  
- **`setup_db.yml`**: Playbook to configure the database (e.g., Autonomous DB setup).  
- **`failover.yml`**: Playbook for failover procedures (e.g., redirect EU-FE-01 to E2.1.Micro).  
- **`restore.yml`**: Playbook to restore weights and configurations after failover.
