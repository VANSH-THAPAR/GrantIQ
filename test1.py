import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://www.myscheme.gov.in/search")
        await page.wait_for_timeout(5000)
        
        has_next = await page.evaluate('''() => {
            const buttons = Array.from(document.querySelectorAll('button, a, li, div'));
            const nextBtn = buttons.find(b => {
                const aria = b.getAttribute('aria-label') || '';
                const text = b.innerText || '';
                const title = b.getAttribute('title') || '';
                const isNext = aria.toLowerCase().includes('next') || text.toLowerCase().includes('next') || title.toLowerCase().includes('next');
                return isNext;
            });
            if (nextBtn) { return nextBtn.outerHTML; }
            
            // Check for right arrow SVG
            const svgBtn = buttons.find(b => b.innerHTML.includes('M9 18l6-6-6-6') || b.querySelector('svg[data-testid="KeyboardArrowRightIcon"]'));
            if (svgBtn) return svgBtn.outerHTML;
            
            return "NOT FOUND";
        }''')
        print("NEXT BTN =>", has_next)
        await browser.close()

asyncio.run(main())
