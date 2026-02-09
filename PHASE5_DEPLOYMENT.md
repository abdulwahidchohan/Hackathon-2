# Phase V: Cloud Deployment Guide

## Overview
This guide covers deploying the Evolution of Todo application to production cloud infrastructure with Dapr and Kafka.

## Prerequisites
- ✅ Render account (backend deployment)
- ✅ Vercel account (frontend deployment)
- ✅ Neon PostgreSQL database (already configured)
- 🔲 Cloud Kubernetes cluster (DigitalOcean, Azure, or GCP)
- 🔲 Kafka broker (Confluent Cloud, Upstash, or self-hosted)

## Step 1: Backend on Render ✅

**You're completing this now!**

1. Root Directory: `backend`
2. Dockerfile Path: `Dockerfile`
3. Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `BETTER_AUTH_SECRET`: Your secret key
   - `BETTER_AUTH_DATABASE_URL`: Same as DATABASE_URL
   - `GEMINI_API_KEY`: Your Gemini API key

After deployment, note your backend URL: `https://YOUR-APP.onrender.com`

## Step 2: Update Frontend Environment

### On Your Local Machine:
```bash
# Update frontend/.env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com
```

### On Vercel:
1. Go to Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to: `https://YOUR-RENDER-BACKEND-URL.onrender.com`
3. Redeploy

## Step 3: Kafka Setup

### Option A: Upstash Kafka (Recommended - Free Tier Available)
1. Sign up at [upstash.com](https://upstash.com)
2. Create a Kafka cluster
3. Copy your broker URL and credentials
4. Update `helm/evolution-todo/templates/dapr-config.yaml`:
   ```yaml
   - name: brokers
     value: "YOUR-UPSTASH-ENDPOINT:9092"
   - name: authType
     value: "password"
   - name: saslUsername
     value: "YOUR-USERNAME"
   - name: saslPassword
     value: "YOUR-PASSWORD"
   ```

### Option B: Confluent Cloud
1. Create account at [confluent.cloud](https://confluent.cloud)
2. Create a basic cluster (free tier)
3. Get API keys
4. Update dapr-config.yaml with your credentials

### Option C: Self-Hosted (Advanced)
```bash
# Install Kafka on Kubernetes
kubectl create namespace kafka
kubectl apply -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

## Step 4: Cloud Kubernetes Deployment

### Option A: DigitalOcean Kubernetes (DOKS)
```bash
# Install doctl CLI
# Create cluster
doctl kubernetes cluster create evolution-todo-cluster \
  --region sgp1 \
  --size s-2vcpu-4gb \
  --count 2

# Get kubeconfig
doctl kubernetes cluster kubeconfig save evolution-todo-cluster

# Install Dapr
dapr init --kubernetes --wait

# Deploy application
helm upgrade --install evolution-todo ./helm/evolution-todo \
  --set backend.env.DATABASE_URL="YOUR-NEON-URL" \
  --set backend.env.BETTER_AUTH_SECRET="YOUR-SECRET" \
  --set backend.env.GEMINI_API_KEY="YOUR-KEY"
```

### Option B: Azure Kubernetes Service (AKS)
```bash
# Create resource group
az group create --name evolution-todo-rg --location southeastasia

# Create AKS cluster
az aks create \
  --resource-group evolution-todo-rg \
  --name evolution-todo-cluster \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group evolution-todo-rg --name evolution-todo-cluster

# Install Dapr
dapr init --kubernetes --wait

# Deploy
helm upgrade --install evolution-todo ./helm/evolution-todo
```

### Option C: Google Kubernetes Engine (GKE)
```bash
# Create cluster
gcloud container clusters create evolution-todo-cluster \
  --zone asia-southeast1-a \
  --num-nodes 2

# Get credentials
gcloud container clusters get-credentials evolution-todo-cluster

# Install Dapr
dapr init --kubernetes --wait

# Deploy
helm upgrade --install evolution-todo ./helm/evolution-todo
```

## Step 5: Install Dapr Components

```bash
# Apply Dapr configuration
kubectl apply -f helm/evolution-todo/templates/dapr-config.yaml

# Verify Dapr components
dapr components -k
```

## Step 6: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check Dapr sidecars
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'

# Check services
kubectl get svc

# Check ingress
kubectl get ingress
```

## Step 7: Domain Setup (Optional)

If deploying to cloud Kubernetes:
1. Get LoadBalancer IP: `kubectl get svc evolution-todo-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'`
2. Point your domain DNS A record to this IP
3. Update Helm values with your domain
4. Install cert-manager for HTTPS

## Verification Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Frontend connects to Render backend
- [ ] User signup/login works
- [ ] Tasks can be created/updated
- [ ] AI chatbot works
- [ ] Kafka events published (check logs)
- [ ] Dapr sidecars running
- [ ] All pods healthy in cloud cluster

## Troubleshooting

### Backend not accessible
- Check Render logs
- Verify DATABASE_URL is correct
- Ensure port is set to $PORT in Render

### Frontend 500 errors
- Check NEXT_PUBLIC_API_URL points to Render
- Verify CORS settings in backend
- Check browser console for errors

### Kafka events not working
- Verify broker connection: `kubectl logs <backend-pod> daprd`
- Check Dapr component status: `dapr components -k`
- Ensure topic exists in Kafka

### Dapr issues
- Check sidecar status: `kubectl describe pod <pod-name>`
- View Dapr logs: `kubectl logs <pod-name> -c daprd`
- Verify dapr-config applied: `kubectl get configuration`

## Cost Estimates

- **Render Free Tier**: $0/month (spins down after inactivity)
- **Vercel Free Tier**: $0/month
- **Upstash Kafka**: $0-10/month
- **DOKS (2 nodes)**: ~$24/month
- **AKS (2 nodes)**: ~$140/month
- **GKE (2 nodes)**: ~$145/month

**Recommended setup for hackathon**: Render + Vercel + Upstash = **FREE** 🎉
