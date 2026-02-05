# Phase V: Advanced Cloud Deployment (Kafka & Dapr)

## Architecture

To achieve a truly distributed, event-driven architecture as required by Phase V, we introduce:

1. **Dapr (Distributed Application Runtime)**:
   - Sidebar pattern for microservices.
   - Pub/Sub for event handling.
   - State management abstraction.

2. **Kafka**:
   - Message broker for Dapr Pub/Sub.
   - Handles `task.created`, `task.completed` events asynchronously.

## Event Flow

1. **Task Created**:
   - Backend (FastAPI) -> Dapr Sidecar (Pub/Sub) -> Kafka Topic `tasks`
   - Payload: `{ "event": "task_created", "task_id": 123, "user_id": "..." }`

2. **Analytics/Notification Service (Future)**:
   - Subscribes to `tasks` topic via Dapr.
   - Sends email/notification on `task.completed`.

## Deployment Strategy (DigitalOcean Kubernetes)

- **Cluster**: DOKS (DigitalOcean Kubernetes Service).
- **Database**: Neon Postgres (Serverless).
- **Message Broker**: Kafka (Redpanda or Strimzi Operator on K8s).
- **Ingress**: Nginx Controller.
- **Certificates**: Cert-Manager + Let's Encrypt.

## Helm Chart Updates

The existing `evolution-todo` chart will be updated to include:
- Dapr annotations on Deployments:
  ```yaml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "todo-backend"
    dapr.io/app-port: "8000"
  ```
- Kafka Component definition for Dapr.
