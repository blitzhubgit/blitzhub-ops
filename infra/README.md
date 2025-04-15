# BlitzHub Infrastructure

This directory (`infra/`) contains Ansible playbooks for automating infrastructure tasks for BlitzHub, ensuring efficient setup and maintenance across 15 Oracle Cloud Free Tier accounts. The playbooks manage resources such as virtual machines, databases, load balancers, object storage, and network security configurations.

## Infrastructure Scripts

The following Ansible playbooks are available to manage the BlitzHub infrastructure:

- `setup_network.yml`: Configures the main VCN (`BlitzHubVCN`) and subnets in the EU-NET-01 account, enabling cross-region connectivity via Remote VCN Peering.
- `setup_local_vcn.yml`: Sets up local VCNs in all accounts (except EU-NET-01) and configures Remote VCN Peering to connect to the main VCN.
- `setup_vm.yml`: Configures virtual machines across all accounts (e.g., EU-FE-01 on Oracle Cloud), installing essential packages (`curl`, `git`, UFW, Node Exporter for monitoring) and setting up the firewall (UFW).
- `setup_fe.yml`: Configures Frontend (FE) servers (e.g., EU-FE-01, NA-FE-01) with Node.js (18.20.0), Fastify (4.28.0), Redis (7.2.0), Varnish, Envoy (1.31.0), React (18.3.0), Vite (5.4.0), and Tailwind CSS (3.4.0). Includes i18n support, regional routing, and caching for pages and APIs.
- `setup_be.yml`: Configures Backend (BE) servers (e.g., EU-BE-01, NA-BE-01) with Node.js (18.20.0), Fastify (4.28.0), Redis (7.2.0), RabbitMQ (3.12.0), Varnish, Envoy (1.31.0), and OpenTelemetry (0.52.0). Sets up priority-based routing and API caching.
- `setup_mon.yml`: Configures Monitoring (MON) servers (e.g., EU-MON-01) with K3s (1.30.0), Prometheus (2.54.0), Grafana (11.2.0), Loki (3.1.0), and Jaeger (1.60.0). Monitors SLOs, latency, cache hit ratios, and transaction confirmation times.
- `setup_sol.yml`: Configures Solana (SOL) servers (e.g., EU-SOL-01, AS-SOL-01) with Solana Node (1.18.0) and Redis (7.2.0) for blockhash caching, ensuring low-latency RPC and WebSocket access.
- `setup_sec.yml`: Configures Security (SEC) servers (e.g., EU-SEC-01) with Suricata (7.0.0), CrowdSec (1.5.0), Vault (1.17.0), Wazuh (4.9.0), and Trivy (0.55.0). Includes HashiCorp Vault for secrets management and Wazuh for Telegram alerts.
- `setup_mgmt.yml`: Configures Management (MGMT) servers (e.g., EU-MGMT-01) with Rasa (3.6.0) for chatbot functionality, ArgoCD (2.12.0) for deployments, Telegraf (1.32.0) for social bots, and K3s (1.30.0) for orchestration.
- `setup_db.yml`: Configures the Autonomous Database (e.g., `TokensDBEUFE01`) for each account, creating necessary schemas and tables (e.g., `tokens`, `fees`).
- `setup_load_balancer.yml`: Sets up Flexible Load Balancers (10 Mbps) and Network Load Balancers for each account, enabling HTTP/HTTPS and WebSocket traffic distribution.
- `setup_object_storage.yml`: Configures Object Storage (20 GB per account), creating buckets `AssetsBlitzHubXX` (public) for static assets and `LogsBlitzHubXX` (private) for logs with a 30-day retention policy.
- `setup_network_security.yml`: Configures Security Lists and Network Security Groups (NSGs) for each account, defining ingress and egress rules for services like HTTP, HTTPS, and Solana RPC.
- `failover.yml`: Implements failover procedures (e.g., redirects traffic from EU-FE-01 to an E2.1.Micro instance in case of failure).
- `restore.yml`: Restores weights and configurations after a failover, ensuring the infrastructure returns to its optimal state.
- `check_compliance.yml`: Verifies and corrects configurations for compliance (e.g., Node.js version, open ports, Redis settings, RabbitMQ queues, Solana CLI, Vault, and Prometheus versions).

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
- `oci_credentials_setup.md`: Guide for extracting OCI credentials (Tenancy OCID, User OCID, etc.) to configure Ansible.
- `ansible_tower_monitoring.md`: Guide for monitoring playbook execution in Ansible Tower and verifying success.
- `oracle_accounts.md`: Credentials for the Oracle Cloud accounts.
- `vm_inventory.md`: Inventory of VM IPs across all accounts.
- `frontend_setup.md`: Steps for manual frontend configuration (e.g., React, Vite, Tailwind CSS).
- `backend_setup.md`: Steps for manual backend configuration (e.g., Fastify, RabbitMQ, Redis).
- `monitoring_setup.md`: Steps for manual monitoring setup (e.g., Prometheus, Grafana).
- `solana_setup.md`: Steps for manual Solana node setup.
- `security_setup.md`: Steps for manual security tools setup (e.g., Suricata, Vault, Wazuh).
- `management_setup.md`: Steps for manual management tools setup (e.g., Rasa, ArgoCD).
- `cloudflare_setup.md`: Steps for manual Cloudflare configuration (DNS, WAF, CDN, Rate Limiting).

## Getting Started

1. **Extract OCI Credentials**:
   - Follow `infra/docs/oci_credentials_setup.md` to obtain the necessary OCI credentials (Tenancy OCID, User OCID, Fingerprint, etc.) for each account.

2. **Set Up Cloudflare**:
   - Follow `infra/docs/cloudflare_setup.md` to configure Cloudflare for DNS, CDN, WAF, and Rate Limiting.
   - Ensure DNS records point to Frontend servers, and WAF rules are active before proceeding.

3. **Set Up Ansible Tower**:
   - Follow `infra/docs/ansible_setup.md` to install and configure Ansible Tower on the `EU-MGMT-A1-01` VM.
   - Configure the inventory with all VMs (refer to `vm_inventory.md`).

4. **Execute Playbooks**:
   - Run the playbooks in the following order to set up the infrastructure:
     1. `setup_network.yml` (sets up the main VCN).
     2. `setup_local_vcn.yml` (configures local VCNs and peering).
     3. `setup_vm.yml` (configures VMs with essential software and monitoring agents).
     4. `setup_db.yml` (sets up the Autonomous Database).
     5. `setup_load_balancer.yml` (configures Load Balancers).
     6. `setup_object_storage.yml` (sets up Object Storage buckets).
     7. `setup_network_security.yml` (configures network security rules).
     8. `setup_fe.yml` (configures Frontend servers with React, Fastify, and caching).
     9. `setup_be.yml` (configures Backend servers with Fastify, RabbitMQ, and OpenTelemetry).
     10. `setup_sol.yml` (sets up Solana nodes for RPC and WebSocket access).
     11. `setup_sec.yml` (sets up security tools like Suricata, Vault, and Wazuh).
     12. `setup_mon.yml` (sets up monitoring with Prometheus, Grafana, and Loki).
     13. `setup_mgmt.yml` (sets up management tools like Rasa, ArgoCD, and social bots).
     14. `failover.yml` and `restore.yml` (for failover and recovery, as needed).
     15. `check_compliance.yml` (verifies and corrects configurations for compliance).

5. **Monitor Execution**:
   - Follow `infra/docs/ansible_tower_monitoring.md` to monitor playbook execution in Ansible Tower and verify success.
   - Use Grafana on EU-MON-01 to monitor infrastructure metrics (e.g., latency, cache hit ratio, transaction confirmation time).
   - Check Cloudflare metrics in Grafana ("Cloudflare Performance" dashboard) to ensure caching and WAF are functioning correctly.

6. **Test the Infrastructure**:
   - Test load balancing: `curl http://eu-fe.blitzhub.sol/health`.
   - Test object storage: `oci os object get --bucket-name AssetsBlitzHubEU --name app.js`.
   - Test database connectivity: `sqlplus blitzhub_app@TokensDBEUFE01_high`.
   - Test Solana RPC: `curl http://eu-sol.blitzhub.sol:8899 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getBlockHeight"}'`.
   - Test frontend: Access `http://eu-fe.blitzhub.sol` to verify React app rendering.
   - Test backend API: `curl http://eu-be.blitzhub.sol:3000/api/tokens`.
   - Test monitoring: Access Grafana at `http://eu-mon.blitzhub.sol:3000` and verify dashboards.
   - Test security alerts: Check Wazuh Telegram alerts for suspicious activity.
   - Test Cloudflare caching: `curl -I https://blitzhub.sol/static/app.js` (expect `CF-Cache-Status: HIT`).
   - Test Cloudflare WAF: `curl "https://blitzhub.sol/api/buy?data=<script>alert(1)</script>"` (expect HTTP 403).

## Next Steps

- **Expand Monitoring**: Add more custom metrics to Prometheus (e.g., user activity, token transaction volume) and create additional Grafana dashboards, including deeper Cloudflare analytics (e.g., per-region latency).
- **Enhance Security**: Implement additional Suricata rules for Solana-specific threats, expand Trivy scans to containers, and review Cloudflare WAF logs for false positives.
- **Optimize Performance**: Fine-tune Varnish caching rules, Envoy load balancing, and Cloudflare Argo routing based on traffic patterns.
- **Automate Failover Testing**: Schedule regular failover tests using `failover.yml` and `restore.yml` to ensure reliability, and validate Cloudflare's failover behavior.

For detailed instructions, refer to the documentation in `infra/docs/`.
