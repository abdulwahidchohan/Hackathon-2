$ErrorActionPreference = 'Stop'
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Checking Minikube Images..."
minikube image ls --format table | Select-String "evolution-todo"

Write-Host "`nPod Status:"
kubectl get pods

Write-Host "`nBackend Pod Description (latest):"
$pod = kubectl get pods -l app.kubernetes.io/component=backend -o jsonpath="{.items[0].metadata.name}"
kubectl describe pod $pod
