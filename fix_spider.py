import re
with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\spiders\myscheme_spider.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_logic = '''                has_next = await page.evaluate("""() => {
                    const ul = Array.from(document.querySelectorAll('ul')).find(ul => ul.innerText.includes('1') && ul.innerText.includes('2'));
                    if (!ul) return false;
                    const svgs = Array.from(ul.querySelectorAll('svg'));
                    if (svgs.length === 0) return false;
                    const nextSvg = svgs[svgs.length - 1];
                    if (nextSvg && !nextSvg.classList.contains('cursor-not-allowed') && !nextSvg.classList.contains('!cursor-not-allowed') && !nextSvg.classList.contains('opacity-50')) {
                        nextSvg.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                        return true;
                    }
                    return false;
                }""")'''

old_logic_pattern = r"has_next\s*=\s*await\s+page\.evaluate\(.*?return\s+false;\n\s+\}''\)"
text = re.sub(old_logic_pattern, new_logic, text, flags=re.DOTALL)

with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\spiders\myscheme_spider.py', 'w', encoding='utf-8') as f:
    f.write(text)
