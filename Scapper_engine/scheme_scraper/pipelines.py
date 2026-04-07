import os
import json
import urllib.parse
import scrapy
import google.generativeai as genai
from pymongo import MongoClient
from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class GeminiStructuringPipeline:
    def __init__(self):
        # Configure Gemini API to handle multiple keys mapping
        keys_env = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))
        self.api_keys = [k.strip() for k in keys_env.split(",") if k.strip()]
        self.current_key_idx = 0
        
        if self.api_keys:
            genai.configure(api_key=self.api_keys[self.current_key_idx])

        self.model = genai.GenerativeModel('gemini-2.5-flash')
        import asyncio
        self.lock = asyncio.Lock()
        
        self.system_prompt = """
        Extract the scheme details from this text and return a strict JSON object matching the following schema. 
        If a field is missing, use null.
        Schema:
        {
            "scheme_id": "string",
            "name": "string",
            "description": "string",
            "eligibility": "string",
            "benefits": "string",
            "application_steps": "string",
            "location_tags": ["string"],
            "industry_tags": ["string"],
            "target_audience_tags": ["string"],
            "category_tags": ["string"],
            "date_of_scheme_launch": "string"
        }
        Return ONLY valid JSON. Do not wrap in markdown blocks like ```json ... ```.
        """

    async def process_item(self, item, spider):
        import asyncio
        adapter = ItemAdapter(item)
        raw_text = adapter.get('raw_text')

        if not raw_text:
            raise DropItem("Missing raw_text in item")

        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Call Gemini
                response = await self.model.generate_content_async(self.system_prompt + "\n\nText to process:\n" + raw_text)

                # Clean and parse the JSON response
                result_text = response.text.strip()
                if result_text.startswith("```json"):
                    result_text = result_text[7:-3].strip()
                elif result_text.startswith("```"):
                    result_text = result_text[3:-3].strip()

                structured_data = json.loads(result_text)

                # Populate the item with structured data
                adapter['scheme_id'] = structured_data.get('scheme_id')
                adapter['name'] = structured_data.get('name')
                adapter['description'] = structured_data.get('description')
                adapter['eligibility'] = structured_data.get('eligibility')
                adapter['benefits'] = structured_data.get('benefits')
                adapter['application_steps'] = structured_data.get('application_steps')

                # Arrays for detailed tags
                adapter['location_tags'] = structured_data.get('location_tags', []) 
                adapter['industry_tags'] = structured_data.get('industry_tags', []) 
                adapter['target_audience_tags'] = structured_data.get('target_audience_tags', [])
                adapter['category_tags'] = structured_data.get('category_tags', []) 

                adapter['date_of_scheme_launch'] = structured_data.get('date_of_scheme_launch')

                # Remove the raw text before passing to the next pipeline
                adapter.pop('raw_text', None)

                return item

            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "Quota exceeded" in err_str or "429 Too Many Requests" in err_str:
                    async with self.lock:
                        # Check if multiple keys exist to rotate
                        if len(self.api_keys) > 1:
                            self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                            genai.configure(api_key=self.api_keys[self.current_key_idx])
                            self.model = genai.GenerativeModel('gemini-2.5-flash')
                            
                            spider.logger.warning(f"AI Quota exceeded. Switched to API Key {self.current_key_idx + 1} of {len(self.api_keys)}. Retrying immediately... (Attempt {attempt+1}/{max_retries})")
                            await asyncio.sleep(2) # Brief cooldown for safe switch
                        else:
                            wait_time = 35
                            spider.logger.warning(f"AI Quota exceeded. Only 1 API key provided. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                            await asyncio.sleep(wait_time)
                else:
                    spider.logger.error(f"Failed to process AI structuring for {adapter.get('source_url')}: {e}")
                    raise DropItem(f"AI Structuring failed: {e}")
                    
        raise DropItem("AI Structuring failed after max retries due to quota limits.")

class MongoDBPipeline:
    def __init__(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(mongo_uri)
        self.db = self.client['grantiq_db']

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        data = adapter.asdict()
        
        # Always insert into the 'myscheme_gov_in' collection so they are all queried together with backend
        collection_name = 'myscheme_gov_in'
        collection = self.db[collection_name]
        
        # Ensure indexes exist for fast tag filtering
        collection.create_index("location_tags")
        collection.create_index("industry_tags")
        collection.create_index("target_audience_tags")
        collection.create_index("category_tags")
        
        # upsert based on scheme_id or source_url
        scheme_id = data.get("scheme_id")
        if scheme_id:
            collection.create_index("scheme_id", unique=True)
            query = {"scheme_id": scheme_id}
        else:
            collection.create_index("source_url", unique=True)
            query = {"source_url": data.get("source_url")}
            
        update = {"$set": data}
        
        try:
            collection.update_one(query, update, upsert=True)
            spider.logger.info(f"Inserted/Updated scheme in collection '{collection_name}' from {data.get('source_url')}")
        except Exception as e:
            spider.logger.error(f"Failed to insert into MongoDB '{collection_name}': {e}")
            
        return item

    def close_spider(self, spider):
        self.client.close()

    def close_spider(self, spider):
        self.client.close()
