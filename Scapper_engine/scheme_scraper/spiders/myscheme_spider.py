import scrapy
from scheme_scraper.items import SchemeItem

class MySchemeSpider(scrapy.Spider):
    name = "myscheme"
    allowed_domains = ["myscheme.gov.in"]
    start_urls = ["https://www.myscheme.gov.in/search"]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                },
                callback=self.parse_directory,
                dont_filter=True # Force it to start fresh ignoring previous job history
            )

    async def parse_directory(self, response):
        page = response.meta["playwright_page"]
        collected_urls = set()
        
        try:
            page_number = 1
            while True:
                self.logger.info(f"--- Scraping Directory Page {page_number} ---")
                
                # Wait for the scheme cards to load on the screen
                try:
                    await page.wait_for_selector('a[href*="/schemes/"]', timeout=15000)
                except Exception as e:
                    self.logger.warning(f"Timeout waiting for schemes on page {page_number}. Ending pagination.")
                    break
                
                # Extract all scheme links from the current page
                links = await page.eval_on_selector_all('a[href*="/schemes/"]', "elements => elements.map(e => e.href)")
                
                new_links_found = 0
                for link in links:
                    if "/schemes/" in link and link not in collected_urls:
                        collected_urls.add(link)
                        new_links_found += 1
                        
                        # Yield the request back to Scrapy engine to handle the individual scheme page concurrently
                        yield scrapy.Request(
                            link, 
                            callback=self.parse_scheme,
                            meta={
                                "playwright": True,
                                "playwright_include_page": True,
                            }
                        )
                
                self.logger.info(f"Found {new_links_found} new schemes on page {page_number}. Total queued so far: {len(collected_urls)}")

                # Improved robust 'Next' button clicker logic using javascript evaluation
                has_next = await page.evaluate("""() => {
                    const ul = Array.from(document.querySelectorAll('ul')).find(ul => ul.innerText.includes('1') && ul.innerText.includes('2'));
                    if (!ul) return false;
                    const svgs = Array.from(ul.querySelectorAll('svg'));
                    if (svgs.length === 0) return false;
                    const nextSvg = svgs[svgs.length - 1]; // Next button is the last svg
                    if (nextSvg && !nextSvg.classList.contains('cursor-not-allowed') && !nextSvg.classList.contains('!cursor-not-allowed') && !nextSvg.classList.contains('opacity-50')) {
                        nextSvg.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                        return true;
                    }
                    return false;
                }""")

                if has_next:
                    page_number += 1
                    # Wait 4 seconds for the network to fetch the new list of schemes
                    await page.wait_for_timeout(4000)
                else:
                    self.logger.info(f"No active 'Next' button found. Reached the absolute end! Total schemes queued: {len(collected_urls)}")
                    break
                    
        except Exception as e:
            self.logger.error(f"Error in pagination loop: {e}")
        finally:
            # We ONLY close the master directory page once the while loop finishes!
            await page.close()

    async def parse_scheme(self, response):
        page = response.meta["playwright_page"]
        
        try:
            # Wait for main content area to load
            await page.wait_for_selector('main', timeout=15000)
            await page.wait_for_timeout(2000) # Give JS a moment to fully hydrate text
            
            raw_text = await page.evaluate('''() => {
                const main = document.querySelector('main');
                if (!main) return "";
                const n = main.cloneNode(true);
                const navs = n.querySelectorAll('nav, header, footer, script, style, noscript');
                navs.forEach(nav => nav.remove());
                return n.innerText;
            }''')

            # Ensure we actually got text before sending it to Gemini
            if raw_text and len(raw_text.strip()) > 300:
                item = SchemeItem()
                item['source_url'] = response.url
                item['raw_text'] = raw_text
                yield item
            else:
                self.logger.warning(f"Not enough structural text extracted from {response.url}. Skipping to save API limits.")
            
        except Exception as e:
            self.logger.error(f"Error extracting data from {response.url}: {e}")
        finally:
            await page.close()
