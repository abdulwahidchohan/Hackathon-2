$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Configuring Minikube Docker Env..."
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Building Backend Image (with detailed logging)..."
try {
    docker build --no-cache -t evolution-todo-backend:latest ./backend
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend Build Successful!"
        minikube image ls | Select-String "evolution-todo-backend"
        kubectl rollout restart deployment/evolution-todo-backend
    }
    else {
        Write-Host "Backend Build Failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "Error during build: $_"
}
