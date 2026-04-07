import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://www.myscheme.gov.in/search")
        await page.wait_for_timeout(5000)
        
        # Grab all the button texts
        btns = await page.evaluate('''() => {
            const lists = Array.from(document.querySelectorAll('ul')).filter(ul => ul.innerText.includes('1') && ul.innerText.includes('2'));
            if (lists.length > 0) {
               return lists[0].outerHTML;
            }
            return "NO UL FOUND";
        }''')
        print("PAGINATION HTML =>", btns)
        await browser.close()

asyncio.run(main())
