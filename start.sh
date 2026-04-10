#!/bin/bash

touch /app/logs.txt

# Start Node.js backend
cd /app/backend
npm start >> /app/logs.txt 2>&1 &

# Start Matching Engine
cd /app
python3 -m uvicorn matching_engine:app --host 127.0.0.1 --port 8000 >> /app/logs.txt 2>&1 &

# Start Scraper API
cd /app/GrantIQ-WebScrapper
python3 app.py --port 5001 >> /app/logs.txt 2>&1 &

# Start Nginx in the foreground
nginx -c /etc/nginx/nginx.conf
