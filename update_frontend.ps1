$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Configuring Minikube Docker Env..."
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Updating Frontend Image..."
docker build -t evolution-todo-frontend:latest ./frontend

Write-Host "Restarting Frontend Deployment..."
kubectl rollout restart deployment/evolution-todo-frontend

Write-Host "Done! Refresh your browser in a moment."
