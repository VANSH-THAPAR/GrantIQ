import requests, re
r=requests.get('https://www.myscheme.gov.in/sitemap-0.xml', headers={'User-Agent':'Mozilla/5.0'})
links=re.findall(r'<loc>(.*?)</loc>', r.text)
print(len(links), links[:10])

