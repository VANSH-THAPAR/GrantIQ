import scrapy
from scheme_scraper.items import SchemeItem
import urllib.parse

class StartupIndiaSpider(scrapy.Spider):
    name = "startupindia"
    allowed_domains = ["startupindia.gov.in"]
    start_urls = ["https://www.startupindia.gov.in/content/sih/en/government-schemes.html"]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
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
            self.logger.info("--- Scraping StartupIndia Directory Page ---")

            # Wait for any links to appear (generic wait)
            await page.wait_for_timeout(5000)

            # Find all links on the page
            links = await page.eval_on_selector_all('a', "elements => elements.map(e => e.href)")

            new_links_found = 0
            for link in links:
                # Assuming scheme links contain 'government-schemes' or similar identifiers
                # Adjust '/government-schemes/' to whatever the specific detail page path is if known
                if link and ("scheme" in link.lower() or "funding" in link.lower()) and link not in collected_urls and getattr(self, 'start_urls')[0] != link:
                    collected_urls.add(link)
                    new_links_found += 1

                    yield scrapy.Request(
                        link,
                        callback=self.parse_scheme,
                        meta={
                            "playwright": True,
                            "playwright_include_page": True,
                            "playwright_page_goto_kwargs": {
                                "timeout": 60000,
                                "wait_until": "domcontentloaded",
                            },
                        }
                    )

            self.logger.info(f"Found {new_links_found} potential scheme links. Total queued: {len(collected_urls)}")

        except Exception as e:
            self.logger.error(f"Error in StartupIndia pagination loop: {e}")
        finally:
            await page.close()

    async def parse_scheme(self, response):
        page = response.meta["playwright_page"]

        try:
            self.logger.info(f"--- Extracting Scheme from: {response.url} ---")
            # Let the page fully render
            await page.wait_for_timeout(3000)

            # Abort unneeded resources to speed up page load
            await page.route("**/*", lambda route: route.continue_() if route.request.resource_type in ["document", "script", "xhr", "fetch"] and "clarity.ms" not in route.request.url and "youtube.com" not in route.request.url and "corover.ai" not in route.request.url else route.abort())

            raw_text = await page.evaluate('''() => {
                const body = document.querySelector('body');
                if (!body) return "";
                const n = body.cloneNode(true);
                const navs = n.querySelectorAll('nav, header, footer, script, style, noscript, iframe, .chatbot');
                navs.forEach(nav => nav.remove());
                return n.innerText;
            }''')

            text_len = len(raw_text.strip()) if raw_text else 0
            self.logger.info(f"Extracted {text_len} characters of raw text.")

            # Ensure we actually got text before sending it to Gemini
            if raw_text and text_len > 300:
                self.logger.info(f"Successfully passing {response.url} to Gemini Pipeline...")
                item = SchemeItem()
                item['source_url'] = response.url
                item['raw_text'] = raw_text
                yield item
            else:
                self.logger.warning(f"Not enough structural text ({text_len} chars) extracted from {response.url}. Skipping.")

        except Exception as e:
            self.logger.error(f"Error extracting data from {response.url}: {e}")
        finally:
            self.logger.info(f"Closing Playwright page for {response.url}")
            await page.close()
