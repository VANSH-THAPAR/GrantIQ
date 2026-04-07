import logging
logging.getLogger('pymongo').setLevel(logging.WARNING)

BOT_NAME = "scheme_scraper"

SPIDER_MODULES = ["scheme_scraper.spiders"]
NEWSPIDER_MODULE = "scheme_scraper.spiders"

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Anti-Bot Settings
DOWNLOAD_DELAY = 8
RANDOMIZE_DOWNLOAD_DELAY = True
CONCURRENT_REQUESTS = 2
CONCURRENT_REQUESTS_PER_DOMAIN = 2

# Enable AutoThrottle
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 5
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0

# Playwright configuration for dynamic rendering
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

# Playwright browser parameters
PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,
    "args": [
        "--disable-blink-features=AutomationControlled", # Helps bypass simple bot detections
    ],
}

# Add a random User-Agent middleware (Built-in or custom). 
# We'll use a simple rotation array in settings or just set a standard modern UA here.
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Activate Pipelines
ITEM_PIPELINES = {
   "scheme_scraper.pipelines.GeminiStructuringPipeline": 300,
   "scheme_scraper.pipelines.MongoDBPipeline": 400,
}

# --- Settings for Huge Data & Stability ---

# 1. Limit concurrency to prevent RAM exhaustion from too many Playwright tabs
CONCURRENT_REQUESTS = 4
PLAYWRIGHT_MAX_PAGES_PER_CONTEXT = 4

# 2. Enable pausing and resuming
# If your crawler stops, running the exact same scrapy crawl command again will resume from where it left off!
# JOBDIR = 'crawls/myscheme_state'

# 3. Increase retries for flaky connections
RETRY_ENABLED = True
RETRY_TIMES = 5
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429]

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
