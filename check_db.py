import os
import time
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(r'D:\Projects\GrantIQ\Scapper_engine\.env')
uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
db = client['grantiq_db']
col = db['myscheme_gov_in']

count1 = col.count_documents({})
print(f"Initial count: {count1}")
time.sleep(10)
count2 = col.count_documents({})
print(f"Count after 10s: {count2}")

if count2 > count1:
    print(f"SUCCESS: The scraper is actively saving new schemes! ({count2 - count1} new schemes in 10s)")
else:
    print("WARNING: The count is not increasing. It might be pausing for AI limits or stuck in a loop.")
