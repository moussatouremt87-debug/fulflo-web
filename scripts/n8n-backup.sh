#!/bin/bash
# Backup n8n workflows before VPS migration
set -euo pipefail

BACKUP_DIR=~/fulflo-web/n8n/backups/$(date +%Y%m%d)
mkdir -p "$BACKUP_DIR"

N8N_URL="${N8N_URL:-http://localhost:5678}"
N8N_API_KEY="${N8N_API_KEY:-admin}"

echo "🔄 Backing up n8n workflows from $N8N_URL..."

HTTP_STATUS=$(curl -s -o "$BACKUP_DIR/workflows.json" -w "%{http_code}" \
  "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY")

if [ "$HTTP_STATUS" = "401" ]; then
  echo "🔑 n8n is running but API key is wrong (HTTP 401)."
  echo "   Generate an API key: n8n Settings → API → Create new key"
  echo "   Then run: N8N_API_KEY=your_key bash scripts/n8n-backup.sh"
  rm -f "$BACKUP_DIR/workflows.json"
  exit 1
fi

if [ "$HTTP_STATUS" = "200" ]; then
  WORKFLOW_COUNT=$(python3 -c "import json,sys; d=json.load(open('$BACKUP_DIR/workflows.json')); print(len(d.get('data', d) if isinstance(d, dict) else d))" 2>/dev/null || echo "?")
  echo "✅ n8n workflows backed up → $BACKUP_DIR/workflows.json ($WORKFLOW_COUNT workflows)"
else
  echo "⚠️  n8n unreachable (HTTP $HTTP_STATUS) — is it running at $N8N_URL?"
  echo "   To start n8n: docker run -d -p 5678:5678 --name n8n n8nio/n8n"
  echo "   Or set N8N_URL env var to point to your VPS instance."
  # Write empty backup so the script doesn't fail silently
  echo '{"data":[],"_backup_failed":true}' > "$BACKUP_DIR/workflows.json"
  exit 1
fi
