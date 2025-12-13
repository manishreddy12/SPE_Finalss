# Food Ordering System (Backend Microservices)

This repository contains the backend microservices and infrastructure code for a distributed Food Ordering Application. The system is designed with a microservices architecture, orchestrated using Kubernetes, and monitored via the ELK stack.

> **Note:** This README focuses on the backend services, infrastructure, and DevOps pipelines. The frontend documentation is excluded.

## 🏗️ Architecture

The backend consists of four core node.js microservices:

1.  **Auth Service**: Handles user registration, login, and JWT authentication.
2.  **Order Service**: Manages order creation, retrieval, and status updates.
3.  **Payment Service**: Processes payments with idempotency, fraud detection, and reconciliation features.
4.  **Restaurant Service**: Manages restaurant profiles, menus, and inventory.

### 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Databases**: PostgreSQL (primary data store), Redis (caching and pub/sub).
-   **Containerization**: Docker
-   **Orchestration**: Kubernetes
-   **IaC / Configuration Management**: Ansible
-   **CI/CD**: Jenkins
-   **Monitoring**: ELK Stack (Elasticsearch, Logstash, Kibana) + Filebeat
-   **Security**: Trivy (Image & Filesystem scanning)

---

## 🚀 Getting Started

You can run the system locally using Docker for development or deploy it to a Kubernetes cluster.

### Prerequisites

-   Docker & Docker Compose
-   Kubernetes Cluster (e.g., Minikube)
-   `kubectl` CLI
-   Jenkins (for running the CI/CD pipeline)
-   Ansible

### Option 1: Local Development (Docker)

Use the provided helper script to set up the local infrastructure (Postgres & Redis) and initialize database schemas without a full K8s cluster.

```bash
chmod +x setup-infra.sh
./setup-infra.sh
```

This will:
-   Create a docker network `food-ordering-net`.
-   Start PostgreSQL and Redis containers.
-   Initialize the necessary database schemas for all services.

You can then run individual services locally using `npm run dev` in their respective directories (ensure environment variables are configured to point to localhost DBs).

### Option 2: Kubernetes Deployment

To deploy the entire stack to a Kubernetes cluster (Namespace: `food-app`).

1.  **Start Minikube** (if not running):
    ```bash
    minikube start
    ```

2.  **Run the Deployment Script**:
    ```bash
    chmod +x deploy-k8s.sh
    ./deploy-k8s.sh
    ```

    This script orchestrates the entire deployment:
    -   Creates the `food-app` namespace.
    -   Builds Docker images for all services (pointed to Minikube's Docker daemon).
    -   Deploys PostgreSQL and Redis.
    -   Initializes Database Schemas.
    -   Deploys all microservices (Auth, Order, Payment, Restaurant).
    -   Applies **Horizontal Pod Autoscalers (HPA)**.
    -   Deploys **Filebeat** for log forwarding.

3.  **Verify Deployment**:
    ```bash
    kubectl get pods -n food-app
    ```

---

## 🔄 CI/CD Pipeline

This project uses **Jenkins** for Continuous Integration and Deployment. The `Jenkinsfile` defines the pipeline stages:

1.  **Checkout**: Pulls code from the repository.
2.  **Determine Changed Services**: Analyzes git diffs to identify which services (Auth, Order, Payment, Restaurant) have changed to optimize builds.
3.  **Security Scan (SAST)**: Runs `trivy fs` to scan the codebase for vulnerabilities.
4.  **Build Docker Images**: Builds images only for the changed services.
5.  **Scan Docker Images**: Runs `trivy image` on the built artifacts.
6.  **Push to DockerHub**: Pushes images to the registry (requires credentials).
7.  **Deploy to Kubernetes**: Uses **Ansible** (`ansible/deploy-all-services.yml`) to update the cluster.
8.  **Load Test & HPA**: Runs a load test script to verify autoscaling behavior.

---

## 📊 Monitoring (ELK Stack)

The system is integrated with the **ELK Stack** for centralized logging.

-   **Filebeat**: Deployed as a DaemonSet/Sidecar (configured in `filebeat.yaml`) to ship logs from microservices to Logstash/Elasticsearch.
-   **Kibana**: Visualize logs and metrics.

To deploy the logging stack, ensure `filebeat.yaml` is applied:
```bash
kubectl apply -f filebeat.yaml
```

---

## 🧪 Testing

### Load Testing
To test the Horizontal Pod Autoscaling (HPA) and system resilience, use the load test script:

```bash
chmod +x load-test.sh
./load-test.sh
```
This spins up a traffic generator pod hitting the `auth-service` to trigger CPU spikes and scale-out events.

### Unit/Integration Tests
Each service contains its own test suite. Navigate to a service directory and run:

```bash
npm test
```
