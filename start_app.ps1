$ErrorActionPreference = 'Stop'
$scriptName = $MyInvocation.MyCommand.Definition

if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Re-launching as Administrator..."
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptName`""
    Exit
}

Write-Host "Running as Administrator."
$hostsFile = "$env:systemroot\system32\drivers\etc\hosts"
$entry = "127.0.0.1 local.evolution-todo.com"

if (Select-String -Path $hostsFile -Pattern "local.evolution-todo.com" -Quiet) {
    Write-Host "Hosts entry already exists."
}
else {
    Write-Host "Adding entry to hosts file..."
    Add-Content -Path $hostsFile -Value "`r`n$entry"
    Write-Host "Hosts entry added."
}

Write-Host "Starting Minikube Tunnel..."
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
minikube tunnel
