$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Configuring local environment to use Minikube's Docker daemon..."
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Building Backend Image (inside Minikube)..."
docker build -t evolution-todo-backend:latest ./backend

Write-Host "Building Frontend Image (inside Minikube)..."
docker build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://local.evolution-todo.com ./frontend

Write-Host "Restarting Deployments to pick up new images..."
kubectl rollout restart deployment/evolution-todo-backend
kubectl rollout restart deployment/evolution-todo-frontend

Write-Host "Fix Complete! Waiting for pods to stabilize..."
Start-Sleep -Seconds 10
kubectl get pods
