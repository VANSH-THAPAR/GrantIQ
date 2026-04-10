FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x

RUN apt-get update && apt-get install -y \
    python3.10 python3-pip python3-dev \
    curl nginx \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . /app

# Setup Matching Engine
RUN pip3 install --no-cache-dir -r requirements_matching.txt
RUN python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Setup Scraper API
RUN pip3 install --no-cache-dir -r GrantIQ-WebScrapper/requirements.txt

# Setup Node.js Backend
WORKDIR /app/backend
RUN npm install
# Install local Playwright browsers
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

WORKDIR /app

# Setup Nginx
COPY nginx.conf /etc/nginx/nginx.conf

RUN chmod +x start.sh

EXPOSE 7860

CMD ["./start.sh"]
