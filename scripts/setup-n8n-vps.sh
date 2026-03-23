#!/bin/bash
# FulFlo n8n VPS Setup Script
# Sets up n8n on a fresh Hetzner CX11 (€4.15/mois)
set -euo pipefail

echo "=== FulFlo n8n VPS Setup ==="
echo ""
echo "Prerequisites:"
echo "  1. Create Hetzner account at hetzner.com"
echo "  2. Create CX11 server (Ubuntu 24.04, €4.15/mois)"
echo "  3. SSH into your server: ssh root@YOUR_VPS_IP"
echo "  4. Run the block below on the VPS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COPY-PASTE THIS INTO YOUR VPS SSH SESSION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'VPSSCRIPT'
#!/bin/bash
set -e

# 1. Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER || true

# 2. Create data directory
mkdir -p /opt/n8n/data

# 3. Start n8n
VPS_IP=$(curl -s ifconfig.me)
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e NODE_ENV=production \
  -e N8N_ENCRYPTION_KEY=fulflo_n8n_key_2026 \
  -e WEBHOOK_URL=http://${VPS_IP}:5678 \
  -v /opt/n8n/data:/home/node/.n8n \
  n8nio/n8n

echo ""
echo "✅ n8n is running at http://${VPS_IP}:5678"
echo ""
echo "Next steps:"
echo "  1. Open http://${VPS_IP}:5678 and create admin account"
echo "  2. Go to Settings → API → Create API key"
echo "  3. Run in Vercel: vercel env add N8N_WEBHOOK_URL production"
echo "     Value: http://${VPS_IP}:5678"
echo "  4. Restore workflows: N8N_API_KEY=your_key N8N_URL=http://${VPS_IP}:5678 bash n8n-backup.sh"
VPSSCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "LOCAL STATUS:"
echo ""

# Check local n8n
if curl -sf http://localhost:5678/healthz > /dev/null 2>&1; then
  echo "✅ Local n8n is running at http://localhost:5678"
else
  echo "⚪ Local n8n not running (expected if using VPS)"
fi

echo ""
echo "Vercel env reminder: set N8N_WEBHOOK_URL after VPS IP is known"
echo "  vercel env add N8N_WEBHOOK_URL production"
