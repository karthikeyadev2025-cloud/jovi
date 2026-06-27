#!/bin/bash
# ============================================================
# JOVIO — Quick Deploy / Update Script
# Run this every time you push new code
# Usage: bash deploy.sh
# ============================================================

set -e

echo "🚀 Jovio — Deploying latest code..."

cd /home/ubuntu/jovi
git pull origin main

# Update voice pipeline
echo "📦 Updating Python dependencies..."
cd /home/ubuntu/jovi/voice-pipeline
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate

# Update API server
echo "📦 Updating Node dependencies..."
cd /home/ubuntu/jovi/api-server
npm install --quiet
npm run build 2>/dev/null || true

# Restart services
echo "🔄 Restarting services..."
sudo supervisorctl restart jovio-pipeline
sudo supervisorctl restart jovio-api

# Health check
sleep 3
echo "🏥 Health check..."
curl -s http://localhost:8000/health && echo "" || echo "⚠️ Pipeline not responding yet, check logs"
curl -s http://localhost:4000/health && echo "" || echo "⚠️ API not responding yet, check logs"

echo ""
echo "✅ Deploy complete!"
echo "📋 Logs: sudo tail -f /var/log/jovio-pipeline.out.log"
