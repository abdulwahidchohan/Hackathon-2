$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Starting Minikube..."
minikube start --driver=docker --addons=ingress --force

Write-Host "Building Backend Image..."
minikube image build -t evolution-todo-backend:latest ./backend

Write-Host "Building Frontend Image..."
minikube image build -t evolution-todo-frontend:latest --build-arg NEXT_PUBLIC_API_URL=http://local.evolution-todo.com ./frontend

Write-Host "Deploying with Helm..."
helm upgrade --install evolution-todo ./helm/evolution-todo

Write-Host "Deployment Complete!"
Write-Host "Please run 'minikube tunnel' in a separate Administrator terminal to access the app at http://local.evolution-todo.com"
