#!/bin/bash

touch /app/logs.txt

# Load Environment variables so Node.js can start
export JWT_SECRET="2323.,//.,Secret_keyyyyy_*&&3243ITREdfkjdkfjnddf"
export MONGO_URI="mongodb+srv://vanshthaparprofessional_db_user:vansh14082005@grantiq.vedposr.mongodb.net/"
export GEMINI_API_KEY="AIzaSyDJwTxvbfjb7ETTt79EDUa_eonRH7VVoAk,AIzaSyCvp_uqgV6eR9LXhEiyO3OR0DzDOQ-TFYc,AIzaSyCRAmPZDKPjADqvuZtUVSgROnbqpFaPahA,AIzaSyBqnY1tQGYdENf4Zq5vbYsNMXXU56k0nOs,AIzaSyCXl19iVT3jDirKIhT9nU5pyMi6T_3UGJA,AIzaSyB9CR9gIjHvSi3Ll0Sr-BfPndzFGdtJ-bc,AIzaSyBz_iDzbKqu2lRtz9zxBdrOLazdQmw1LeU,AIzaSyD3DmDKT4jonLWSF51aM6erAFraRigl23Q,AIzaSyA3l-g-qdx5c-qxEC7dhuxlTE4Uu4CM_XQ,AIzaSyD9Epi0W01_eBprP_REQ3Ip-yoY_63VwxQ,AIzaSyCoMzmE9_IxpEsGmAXTqtL-F_st6k8OUb8"

# Start Node.js backend
cd /app/backend
npm start >> /app/logs.txt 2>&1 &

# Start Matching Engine
cd /app
uvicorn matching_engine:app --host 127.0.0.1 --port 8000 >> /app/logs.txt 2>&1 &

# Start Scraper API
cd /app/GrantIQ-WebScrapper
python3 app.py --port 5001 >> /app/logs.txt 2>&1 &

# Start Nginx in the foreground
nginx -c /etc/nginx/nginx.conf
