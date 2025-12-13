# Payment Service

Payment microservice with idempotency, fraud detection, and reconciliation.

## specific Prerequisites

- Node.js >= 18
- Docker & Docker Compose

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Build Docker Image**
    ```bash
    docker build -t payment-service:latest .
    ```

3.  **Start Infrastructure (Kubernetes)**
    ```bash
    # Ensure you have a k8s cluster running (e.g., Docker Desktop, Minikube)
    kubectl apply -f k8s/
    ```

4.  **Verify Running**
    ```bash
    kubectl get pods
    kubectl get services
    ```

5.  **Accessing/Testing**
    Forward ports to run tests locally:
    ```bash
    # Open separate terminals:
    kubectl port-forward svc/postgres 5432:5432
    kubectl port-forward svc/redis 6379:6379
    kubectl port-forward svc/payment-service 3003:3003
    ```

6.  **Run Tests**
    ```bash
    npm test
    node e2etest.js
    ```

## Development

- **Run in Dev Mode**: `npm run dev`
- **Run Tests**: `npm test`
- **Lint Code**: `npm run lint`

## Configuration

Environment variables are managed in `.env`.
