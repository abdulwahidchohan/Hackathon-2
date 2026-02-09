#!/usr/bin/env pwsh
# Phase V Deployment Automation Script

param(
    [Parameter(Mandatory = $true)]
    [string]$RenderBackendUrl
)

$ErrorActionPreference = 'Stop'

Write-Host "🚀 Phase V Deployment Automation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Validate URL format
if (-not ($RenderBackendUrl -match '^https://.*\.onrender\.com$')) {
    Write-Host "❌ Invalid Render URL format. Expected: https://YOUR-APP.onrender.com" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Using Backend URL: $RenderBackendUrl" -ForegroundColor Green

# Step 1: Update local frontend .env
Write-Host "`n📝 Step 1: Updating frontend/.env..." -ForegroundColor Yellow
$frontendEnvPath = "frontend\.env"
$envContent = Get-Content $frontendEnvPath -Raw

# Update NEXT_PUBLIC_API_URL
$envContent = $envContent -replace 'NEXT_PUBLIC_API_URL=.*', "NEXT_PUBLIC_API_URL=$RenderBackendUrl"

Set-Content -Path $frontendEnvPath -Value $envContent
Write-Host "✅ Frontend .env updated!" -ForegroundColor Green

# Step 2: Update Helm values for cloud deployment
Write-Host "`n📝 Step 2: Updating Helm values..." -ForegroundColor Yellow
$helmValuesPath = "helm\evolution-todo\values.yaml"
$helmContent = Get-Content $helmValuesPath -Raw

# Update frontend API URL
$helmContent = $helmContent -replace 'NEXT_PUBLIC_API_URL:.*', "NEXT_PUBLIC_API_URL: `"$RenderBackendUrl`""

Set-Content -Path $helmValuesPath -Value $helmContent
Write-Host "✅ Helm values updated!" -ForegroundColor Green

# Step 3: Create Vercel environment update script
Write-Host "`n📝 Step 3: Generating Vercel update commands..." -ForegroundColor Yellow
$vercelCommands = @"
# Run these commands to update Vercel environment variables:

vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: $RenderBackendUrl

# Or update via Vercel Dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project: hackathon-2-todo-pi
# 3. Settings → Environment Variables
# 4. Edit NEXT_PUBLIC_API_URL
# 5. Change value to: $RenderBackendUrl
# 6. Save and redeploy
"@

Set-Content -Path "UPDATE_VERCEL.txt" -Value $vercelCommands
Write-Host "✅ Vercel update commands saved to UPDATE_VERCEL.txt" -ForegroundColor Green

# Step 4: Test backend health
Write-Host "`n📝 Step 4: Testing backend health..." -ForegroundColor Yellow
try {
    $healthUrl = "$RenderBackendUrl/health"
    Write-Host "   Checking: $healthUrl" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Backend health check failed. It might still be deploying..." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📋 Deployment Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Local files updated" -ForegroundColor Green
Write-Host "   - frontend/.env" -ForegroundColor Gray
Write-Host "   - helm/evolution-todo/values.yaml" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update Vercel (see UPDATE_VERCEL.txt)" -ForegroundColor White
Write-Host "   2. Test your app: https://hackathon-2-todo-pi.vercel.app" -ForegroundColor White
Write-Host "   3. (Optional) Deploy to cloud K8s - see PHASE5_DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Phase V deployment preparation complete!" -ForegroundColor Green
Write-Host ""
