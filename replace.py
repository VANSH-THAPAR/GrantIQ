with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\spiders\myscheme_spider.py', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find("has_next = await page.evaluate('''() => {")
end = text.find("\n                }''')", start) + len("\n                }''')")

if start == -1 or end < start:
    print("Could not find block")
else:
    new_text = '''has_next = await page.evaluate("""() => {
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
                }""")'''
    text = text[:start] + new_text + text[end:]
    with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\spiders\myscheme_spider.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced!")
