import scrapy
from scheme_scraper.items import SchemeItem

class IndiaGovSpider(scrapy.Spider):
    name = "india_gov"
    allowed_domains = ["india.gov.in"]
    
    # Custom settings to bypass India.gov.in strict WAF / Antibot
    custom_settings = {
        "PLAYWRIGHT_LAUNCH_OPTIONS": {
            "headless": False,  # Running visibly bypasses most modern bot detectors instantly
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--disable-web-security",
                "--incognito"
            ],
        },
        "DOWNLOADER_MIDDLEWARES": {
            "scrapy.downloadermiddlewares.useragent.UserAgentMiddleware": None,
            "scrapy.downloadermiddlewares.retry.RetryMiddleware": None,
        }
    }

    start_urls = [
        "https://www.india.gov.in/my-government/schemes",
        "https://www.india.gov.in/"
    ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                headers={
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "max-age=0",
                    "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"Windows"',
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Upgrade-Insecure-Requests": "1"
                },
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_context_kwargs": {
                        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                        "viewport": {"width": 1920, "height": 1080},
                        "bypass_csp": True,
                        "extra_http_headers": {
                            "Accept-Language": "en-US,en;q=0.9",
                        }
                    },
                    "playwright_page_goto_kwargs": {
                        "timeout": 60000,
                        "wait_until": "domcontentloaded",
                    },
                },
                callback=self.parse_directory,
                dont_filter=True 
            )

    async def parse_directory(self, response):
        page = response.meta["playwright_page"]
        collected_urls = set()

        try:
            self.logger.info(f"--- Scraping india.gov.in Directory Page: {response.url} ---")
            await page.wait_for_timeout(5000)

            # Find all links on the page
            links = await page.eval_on_selector_all('a', "elements => elements.map(e => e.href)")

            new_links_found = 0
            for link in links:
                # We target links that are likely to be scheme or policy related
                if link and any(keyword in link.lower() for keyword in ["scheme", "yojana", "policy", "programme", "initiative"]) and link not in collected_urls:
                    collected_urls.add(link)
                    new_links_found += 1

                    yield scrapy.Request(
                        link,
                        headers={
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.9",
                            "Cache-Control": "max-age=0",
                            "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                            "Sec-Ch-Ua-Mobile": "?0",
                            "Sec-Ch-Ua-Platform": '"Windows"',
                            "Sec-Fetch-Dest": "document",
                            "Sec-Fetch-Mode": "navigate",
                            "Sec-Fetch-Site": "none",
                            "Sec-Fetch-User": "?1",
                            "Upgrade-Insecure-Requests": "1"
                        },
                        callback=self.parse_scheme,
                        meta={
                            "playwright": True,
                            "playwright_include_page": True,
                            "playwright_context_kwargs": {
                                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                            },
                            "playwright_page_goto_kwargs": {
                                "timeout": 60000,
                                "wait_until": "domcontentloaded",
                            },
                        }
                    )

            self.logger.info(f"Found {new_links_found} potential scheme links. Total queued: {len(collected_urls)}")

        except Exception as e:
            self.logger.error(f"Error in india.gov.in pagination loop: {e}")
        finally:
            await page.close()

    async def parse_scheme(self, response):
        page = response.meta["playwright_page"]

        try:
            self.logger.info(f"--- Extracting Scheme from: {response.url} ---")
            await page.wait_for_timeout(3000)

            raw_text = await page.evaluate('''() => {
                const body = document.querySelector('body');
                if (!body) return "";
                const n = body.cloneNode(true);
                const navs = n.querySelectorAll('nav, header, footer, script, style, noscript, iframe');
                navs.forEach(nav => nav.remove());
                return n.innerText;
            }''')

            text_len = len(raw_text.strip()) if raw_text else 0

            # Ensure we actually got text before sending it to Gemini
            if raw_text and text_len > 300:
                self.logger.info(f"Successfully passing {response.url} to Gemini Pipeline...")
                item = SchemeItem()
                item['source_url'] = response.url
                item['raw_text'] = raw_text
                yield item
            else:
                self.logger.warning(f"Not enough structural text ({text_len} chars) extracted. Skipping.")

        except Exception as e:
            self.logger.error(f"Error extracting data from {response.url}: {e}")
        finally:
            await page.close()