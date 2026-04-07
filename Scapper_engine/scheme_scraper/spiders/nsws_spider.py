import scrapy
from scheme_scraper.items import SchemeItem

class NswsSpider(scrapy.Spider):
    name = "nsws"
    allowed_domains = ["nsws.gov.in"]
    start_urls = [
        "https://www.nsws.gov.in/",
        "https://www.nsws.gov.in/schemes",
        "https://www.nsws.gov.in/all-schemes"
    ]

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
            self.logger.info(f"--- Scraping NSWS Directory Page: {response.url} ---")
            await page.wait_for_timeout(5000)

            # Find all links on the page
            links = await page.eval_on_selector_all('a', "elements => elements.map(e => e.href)")

            new_links_found = 0
            for link in links:
                # We target links that look like schemes, approvals, or policies
                if link and any(keyword in link.lower() for keyword in ["scheme", "approval", "policy"]) and link not in collected_urls:
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
            self.logger.error(f"Error in NSWS pagination loop: {e}")
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