# BlitzHub Infrastructure

This directory (`infra/`) contains Ansible playbooks for automating infrastructure tasks for BlitzHub, ensuring efficient setup and maintenance across 15 Oracle Cloud Free Tier accounts. The playbooks manage resources such as virtual machines, databases, load balancers, object storage, and network security configurations.

## Infrastructure Scripts

The following Ansible playbooks are available to manage the BlitzHub infrastructure:

- **`setup_network.yml`**: Configures the main VCN (`BlitzHubVCN`) and subnets in the EU-NET-01 account, enabling cross-region connectivity via Remote VCN Peering.  
- **`setup_local_vcn.yml`**: Sets up local VCNs in all accounts (except EU-NET-01) and configures Remote VCN Peering to connect to the main VCN.  
- **`setup_vm.yml`**: Configures virtual machines across all accounts (e.g., EU-FE-01 on Oracle Cloud), installing essential packages (Node.js, Redis) and setting up the firewall (UFW). Also configures HashiCorp Vault in EU-SEC-01.  
- **`setup_db.yml`**: Configures the Autonomous Database (e.g., `TokensDBEUFE01`) for each account, creating necessary schemas and tables (e.g., `tokens`, `fees`).  
- **`setup_load_balancer.yml`**: Sets up Flexible Load Balancers (10 Mbps) and Network Load Balancers for each account, enabling HTTP/HTTPS and WebSocket traffic distribution.  
- **`setup_object_storage.yml`**: Configures Object Storage (20 GB per account), creating buckets `AssetsBlitzHubXX` (public) for static assets and `LogsBlitzHubXX` (private) for logs with a 30-day retention policy.  
- **`setup_network_security.yml`**: Configures Security Lists and Network Security Groups (NSGs) for each account, defining ingress and egress rules for services like HTTP, HTTPS, and Solana RPC.  
- **`failover.yml`**: Implements failover procedures (e.g., redirects traffic from EU-FE-01 to an E2.1.Micro instance in case of failure).  
- **`restore.yml`**: Restores weights and configurations after a failover, ensuring the infrastructure returns to its optimal state.

## Documentation

Detailed setup instructions and configurations are available in the `infra/docs/` directory:

- `account_setup.md`: Guide for creating emails and Oracle Cloud accounts.  
- `ssh_setup.md`: Instructions for generating and using SSH keys.  
- `vm_creation.md`: Steps for manual VM creation on Oracle Cloud.  
- `ansible_setup.md`: Detailed setup for Ansible Tower and playbook execution.  
- `load_balancer_setup.md`: Manual configuration steps for Load Balancers.  
- `object_storage_setup.md`: Manual configuration steps for Object Storage.  
- `database_setup.md`: Manual configuration steps for Autonomous Database.  
- `network_security_setup.md`: Manual configuration steps for Security Lists and NSGs.  
- `oracle_accounts.md`: Credentials for the Oracle Cloud accounts.  
- `vm_inventory.md`: Inventory of VM IPs across all accounts.

## Getting Started

1. **Set Up Ansible Tower**:
   - Follow `infra/docs/ansible_setup.md` to install and configure Ansible Tower on the `EU-MGMT-A1-01` VM.
   - Configure the inventory with all VMs (refer to `vm_inventory.md`).

2. **Execute Playbooks**:
   - Run the playbooks in the following order to set up the infrastructure:
     1. `setup_network.yml` (sets up the main VCN).
     2. `setup_local_vcn.yml` (configures local VCNs and peering).
     3. `setup_vm.yml` (configures VMs with necessary software).
     4. `setup_db.yml` (sets up the Autonomous Database).
     5. `setup_load_balancer.yml` (configures Load Balancers).
     6. `setup_object_storage.yml` (sets up Object Storage buckets).
     7. `setup_network_security.yml` (configures network security rules).
     8. `failover.yml` and `restore.yml` (for failover and recovery, as needed).

3. **Test the Infrastructure**:
   - Test load balancing: `curl http://eu-fe.blitzhub.sol/health`.
   - Test object storage: `oci os object get --bucket-name AssetsBlitzHubEU --name app.js`.
   - Test database connectivity: `sqlplus blitzhub_app@TokensDBEUFE01_high`.

## Next Steps

- **Backend Setup**: Configure Fastify, RabbitMQ, and Redis on EU-BE-01 and NA-BE-01 (see `infra/docs/backend_setup.md` once created).  
- **Frontend Setup**: Deploy React, Vite, and Tailwind on frontend accounts (e.g., EU-FE-01, NA-FE-01; see `infra/docs/frontend_setup.md` once created).  
- **Monitoring**: Set up Prometheus and Grafana on EU-MON-01 for monitoring infrastructure metrics.

For detailed instructions, refer to the documentation in `infra/docs/`.
