
(venv) PS C:\Vansh_hackathon_work\GrantIQ-WebScrapper> python .\scraper.py
Connecting to MongoDB...
Launching Stealth Headless Browser... (this may take up to 10 seconds)
[*] Accessing exact schemes directly via parent API sitemaps...
[*] Successfully bypassed WAF via sitemaps. Found 0 unique scheme URLs.
[*] Retrieving scheme URLs through the DOM on /search...
[*] Scraping page 1...
[*] Found 10 URLs on page 1. Total unique so far: 10
[*] No active 'Next' button found. Reached the last page.
[*] Successfully bypassed WAF and fetched DOM. Found 10 unique scheme URLs.
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/pmsby
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/post-dis
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/rmewf-disabled-child
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/nos-swd
[5/10] Deep scraping scheme dynamically via Selenium: https://www.myscheme.gov.in/schemes/sui
      -> Successfully AI-extracted & saved schema to MongoDB!
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/rmewf
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/rmewf-vocational-training
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/wos-c
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/nps-tsep
    [-] Skipping (already in DB): https://www.myscheme.gov.in/schemes/sl

Entire Website AI Structuring & Web Scraping Complete!
(venv) PS C:\Vansh_hackathon_work\GrantIQ-WebScrapper> 