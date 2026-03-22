#!/bin/bash
echo "n8n is currently running on localhost:5678"
echo "To deploy to production VPS:"
echo "1. Get a Hetzner CX11 (€4.15/mois) at hetzner.com"
echo "2. SSH into server"
echo "3. Run: docker run -d --name n8n -p 5678:5678 n8nio/n8n"
echo "4. Update N8N_WEBHOOK_URL in Vercel to https://YOUR_VPS_IP:5678"
echo ""
echo "Current n8n status: $(curl -s http://localhost:5678/healthz 2>/dev/null || echo 'offline')"
