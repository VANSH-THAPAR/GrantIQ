#!/bin/bash

# Start Node.js backend
cd /app/backend
npm start &

# Start Matching Engine
cd /app
uvicorn matching_engine:app --host 127.0.0.1 --port 8000 &

# Start Scraper API
cd /app/GrantIQ-WebScrapper
python3 app.py --port 5001 &

# Start Nginx in the foreground
nginx -c /etc/nginx/nginx.conf
