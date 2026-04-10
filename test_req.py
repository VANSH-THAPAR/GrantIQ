import requests

payload = {
  "name": "Digimantra",
  "industry": "Software",
  "business_stage": "startup",
  "annual_revenue_crores": 2.5,
  "location": {
    "state": "National",
    "scope": "national"
  },
  "founded_year": 2019,
  "employee_count": 25,
  "registered_category": "Private Limited",
  "women_led": False,
  "export_focused": False
}

try:
    r = requests.post("http://127.0.0.1:8000/api/v1/recommend", json=payload)
    print(r.status_code)
    print(r.text)
except Exception as e:
    print(e)
