# Evolution of Todo — Helm (Phase IV)

Helm chart for deploying the Phase III Todo Chatbot (frontend + backend) on Kubernetes (e.g. Minikube).

## Prerequisites

- **Minikube** — [Install Minikube](https://minikube.sigs.k8s.io/docs/start/)
- **kubectl**
- **Helm 3**
- **Docker** (or Minikube’s built-in Docker)

## Build images (from repo root)

```bash
# Backend
docker build -t evolution-todo-backend:latest ./backend

# Frontend (NEXT_PUBLIC_API_URL must match Ingress host; default in chart is http://local.evolution-todo.com)
docker build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://local.evolution-todo.com ./frontend
```

Load into Minikube (so the cluster can pull the images):

```bash
minikube image load evolution-todo-backend:latest
minikube image load evolution-todo-frontend:latest
```

## Install on Minikube

1. Start Minikube and enable ingress:

   ```bash
   minikube start
   minikube addons enable ingress
   ```

2. Install the chart with secrets (replace placeholders):

   ```bash
   helm install evolution-todo ./helm/evolution-todo \
     --set backend.env.DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
     --set backend.env.BETTER_AUTH_SECRET="your-secret" \
     --set backend.env.OPENAI_API_KEY="sk-..."
   ```

3. Point the Ingress host to Minikube:

   - Get Minikube IP: `minikube ip`
   - Add to hosts (as admin):  
     `echo "<minikube-ip> local.evolution-todo.com" >> /etc/hosts`  
     (On Windows: add the same line to `C:\Windows\System32\drivers\etc\hosts`.)

   Or use tunnel (then use `127.0.0.1` for the host):

   ```bash
   minikube tunnel
   # Then: 127.0.0.1 local.evolution-todo.com in hosts
   ```

4. Open: **http://local.evolution-todo.com** — sign in and use Chat or Tasks.

## Upgrade / uninstall

```bash
helm upgrade evolution-todo ./helm/evolution-todo --set ...
helm uninstall evolution-todo
```

## Chart values (high level)

| Value | Description |
|-------|-------------|
| `backend.image.repository`, `tag` | Backend image name and tag |
| `frontend.image.repository`, `tag` | Frontend image name and tag |
| `backend.env.DATABASE_URL` | Neon PostgreSQL URL |
| `backend.env.BETTER_AUTH_SECRET` | Same as frontend auth |
| `backend.env.OPENAI_API_KEY` | OpenAI API key for chat |
| `frontend.env.NEXT_PUBLIC_API_URL` | Public origin (e.g. `http://local.evolution-todo.com`) |
| `ingress.enabled`, `ingress.host` | Ingress and hostname |

See `helm/evolution-todo/values.yaml` for defaults.
