import scrapy
from scheme_scraper.items import SchemeItem

class MudraSpider(scrapy.Spider):
    name = "mudra"
    allowed_domains = ["mudra.org.in"]
    start_urls = [
        "https://www.mudra.org.in/",
        "https://www.mudra.org.in/Offerings",
        "https://www.mudra.org.in/AboutUs/Purpose",
    ]

    custom_settings = {
        "PLAYWRIGHT_LAUNCH_OPTIONS": {
            "headless": True, # Usually mudra doesn't have extreme WAF, headless should be fine. If not, user can change it.
            "args": [
                "--disable-blink-features=AutomationControlled"
            ],
        }
    }

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                    "playwright_page_goto_kwargs": {
                        "wait_until": "domcontentloaded",
                        "timeout": 60000,
                    },
                },
                callback=self.parse
            )

    async def parse(self, response):
        page = response.meta["playwright_page"]
        
        try:
            self.logger.info(f"--- Extracting Scheme from: {response.url} ---")
            
            # Wait 2 seconds for JS execution (if any)
            await page.wait_for_timeout(2000)

            # Strip out bloat, get inner text
            raw_text = await page.evaluate('''() => {
                const body = document.querySelector('body');
                if (!body) return "";
                const n = body.cloneNode(true);
                const blocks = n.querySelectorAll('nav, header, footer, script, style, noscript, iframe');
                blocks.forEach(b => b.remove());
                return n.innerText;
            }''')

            text_len = len(raw_text.strip()) if raw_text else 0

            # Only yield if we have enough content to be useful
            if raw_text and text_len > 250:
                item = SchemeItem()
                item['source_url'] = response.url
                item['raw_text'] = raw_text
                
                # Check for Mudra specific sub-pages to crawl from the Offerings page
                # If we are on the offerings page, let's grab links that talk about Shishu, Kishore, Tarun, etc.
                if "Offerings" in response.url or response.url == "https://www.mudra.org.in/":
                    links = await page.eval_on_selector_all('a', "elements => elements.map(e => e.href)")
                    for link in links:
                        link_lower = link.lower()
                        if link and 'mudra.org.in' in link_lower and any(keyword in link_lower for keyword in ['shishu', 'kishore', 'tarun', 'eligibility', 'faq', 'documents']):
                            yield scrapy.Request(
                                link,
                                callback=self.parse,
                                meta={
                                    "playwright": True,
                                    "playwright_include_page": True,
                                    "playwright_page_goto_kwargs": {
                                        "wait_until": "domcontentloaded",
                                        "timeout": 60000,
                                    },
                                }
                            )

                yield item
            else:
                self.logger.warning(f"Not enough structural text extracted from {response.url}.")

        except Exception as e:
            self.logger.error(f"Error scraping {response.url}: {e}")
        finally:
            await page.close()
