import scrapy
from urllib.parse import urlparse
from scheme_scraper.items import SchemeItem

class UniversalSchemeSpider(scrapy.Spider):
    name = "universal_schemes"
    
    allowed_domains = [
        "myscheme.gov.in", "startupindia.gov.in", "nsws.gov.in", "india.gov.in", 
        "msme.gov.in", "champions.gov.in", "dcmsme.gov.in", "makeinindia.com", 
        "kviconline.gov.in", "nsic.co.in", "udyamregistration.gov.in", "msh.meity.gov.in", 
        "nidhi.dst.gov.in", "aim.gov.in", "birac.nic.in", "idex.gov.in", 
        "agriwelfare.gov.in", "mofpi.gov.in", "enam.gov.in", "dgft.gov.in", 
        "commerce.gov.in", "apeda.gov.in", "mpeda.gov.in", "sidbi.in", 
        "nabard.org", "mudra.org.in", "standupmitra.in", "nsfdc.nic.in", "gem.gov.in"
    ]
    
    start_urls = [
        "https://www.myscheme.gov.in/search",
        "https://www.startupindia.gov.in/",
        "https://www.nsws.gov.in/",
        "https://www.india.gov.in/",
        "https://msme.gov.in/",
        "https://champions.gov.in/",
        "https://dcmsme.gov.in/",
        "https://www.makeinindia.com/",
        "https://www.kviconline.gov.in/",
        "https://www.nsic.co.in/",
        "https://udyamregistration.gov.in/",
        "https://msh.meity.gov.in/",
        "https://nidhi.dst.gov.in/",
        "https://aim.gov.in/",
        "https://birac.nic.in/",
        "https://idex.gov.in/",
        "https://agriwelfare.gov.in/",
        "https://mofpi.gov.in/",
        "https://enam.gov.in/",
        "https://dgft.gov.in/",
        "https://commerce.gov.in/",
        "https://apeda.gov.in/",
        "https://mpeda.gov.in/",
        "https://www.sidbi.in/",
        "https://www.nabard.org/",
        "https://www.mudra.org.in/",
        "https://www.standupmitra.in/",
        "https://nsfdc.nic.in/",
        "https://gem.gov.in/"
    ]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={"playwright": True, "playwright_include_page": True},
                callback=self.parse_page
            )

    async def parse_page(self, response):
        page = response.meta["playwright_page"]
        
        try:
            # 1. Extract and yield all readable text on this page for Gemini to process
            raw_text = await page.evaluate('''() => {
                const main = document.querySelector('main') || document.body;
                const n = main.cloneNode(true);
                const navs = n.querySelectorAll('nav, header, footer, script, style, noscript');
                navs.forEach(nav => nav.remove());
                return n.innerText;
            }''')

            # Only yield if there's substantial text (filters out empty loading pages)
            if raw_text and len(raw_text.strip()) > 300:
                item = SchemeItem()
                item['source_url'] = response.url
                item['raw_text'] = raw_text
                yield item

            # 2. Automatically find ALL internal links on this page and crawl them
            links = await page.eval_on_selector_all('a[href]', "elements => elements.map(e => e.href)")
            
            for link in links:
                # Basic normalization and filtering
                parsed_link = urlparse(link)
                if parsed_link.netloc.replace("www.", "") in self.allowed_domains:
                    if not any(ext in link.lower() for ext in ['.pdf', '.jpg', '.png', '.zip', '.doc']):
                        yield scrapy.Request(
                            link, 
                            callback=self.parse_page,
                            meta={"playwright": True, "playwright_include_page": True}
                        )

        except Exception as e:
            self.logger.error(f"Error scraping {response.url}: {e}")
        finally:
            await page.close()
