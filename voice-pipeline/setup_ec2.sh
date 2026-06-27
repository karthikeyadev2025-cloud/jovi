#!/bin/bash
# ============================================================
# JOVIO — EC2 Ubuntu Setup Script
# Run this ONCE after SSH into your EC2 instance
# Ubuntu 22.04 LTS, t3.micro or t3.small, Mumbai ap-south-1
# Usage: bash setup_ec2.sh
# ============================================================

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  JOVIO — EC2 Setup  ║"
echo "║  Powered by Jovio Tech Labs          ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. SYSTEM UPDATE ─────────────────────────────────────
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y \
    curl wget git unzip \
    python3.11 python3.11-venv python3-pip \
    nginx certbot python3-certbot-nginx \
    supervisor ufw htop

# ── 2. DOCKER ────────────────────────────────────────────
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# ── 3. CLONE REPO ────────────────────────────────────────
echo "📥 Cloning Jovio repo..."
cd /home/ubuntu
if [ -d "jovi" ]; then
    echo "Repo exists, pulling latest..."
    cd jovi && git pull origin main
    cd /home/ubuntu
else
    git clone https://github.com/jovioglobaltechnologies/jovi.git
fi

# ── 4. PYTHON VENV ───────────────────────────────────────
echo "🐍 Setting up Python environment..."
cd /home/ubuntu/jovi/voice-pipeline
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# ── 5. ENV FILE ──────────────────────────────────────────
echo ""
echo "⚠️  Now create your .env file:"
echo "    nano /home/ubuntu/jovi/voice-pipeline/.env"
echo ""
echo "    Paste all your environment variables."
echo "    Press Ctrl+X then Y to save."
echo ""

# ── 6. SUPERVISOR CONFIG ─────────────────────────────────
echo "⚙️  Configuring Supervisor (process manager)..."
sudo tee /etc/supervisor/conf.d/jovio-pipeline.conf << 'EOF'
[program:jovio-pipeline]
command=/home/ubuntu/jovi/voice-pipeline/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2 --loop asyncio
directory=/home/ubuntu/jovi/voice-pipeline
user=ubuntu
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/jovio-pipeline.err.log
stdout_logfile=/var/log/jovio-pipeline.out.log
environment=HOME="/home/ubuntu",USER="ubuntu",PATH="/home/ubuntu/jovi/voice-pipeline/venv/bin"
EOF

# ── 7. SUPERVISOR API SERVER ─────────────────────────────
sudo tee /etc/supervisor/conf.d/jovio-api.conf << 'EOF'
[program:jovio-api]
command=/usr/bin/node /home/ubuntu/jovi/api-server/dist/index.js
directory=/home/ubuntu/jovi/api-server
user=ubuntu
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/jovio-api.err.log
stdout_logfile=/var/log/jovio-api.out.log
EOF

# ── 8. NGINX CONFIG ──────────────────────────────────────
echo "🌐 Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/jovio << 'EOF'
# Voice Pipeline → port 8000
server {
    listen 80;
    server_name pipeline.jovio.in;

    location / {
        proxy_pass         http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}

# API Server → port 4000
server {
    listen 80;
    server_name api.jovio.in;

    location / {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/jovio /etc/nginx/sites-enabled/jovio
sudo nginx -t && sudo systemctl restart nginx

# ── 9. FIREWALL ──────────────────────────────────────────
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 8000   # Voice pipeline direct
sudo ufw allow 4000   # API server direct
sudo ufw --force enable

# ── 10. NODE.JS (for API server) ─────────────────────────
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
cd /home/ubuntu/jovi/api-server
npm install
npm run build 2>/dev/null || echo "Build step skipped (no build script)"

# ── 11. START SERVICES ───────────────────────────────────
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start jovio-pipeline
sudo supervisorctl start jovio-api

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ JOVIO EC2 SETUP COMPLETE!            ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Voice Pipeline: http://localhost:8000   ║"
echo "║  API Server:     http://localhost:4000   ║"
echo "║                                          ║"
echo "║  Test: curl http://localhost:8000/health ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "NEXT STEPS:"
echo "1. Create .env file: nano /home/ubuntu/jovi/voice-pipeline/.env"
echo "2. Restart pipeline: sudo supervisorctl restart jovio-pipeline"
echo "3. Add SSL: sudo certbot --nginx -d pipeline.jovio.in -d api.jovio.in"
echo "4. Check logs: sudo tail -f /var/log/jovio-pipeline.out.log"
