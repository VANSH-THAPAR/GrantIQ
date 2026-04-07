import re

with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\pipelines.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace initialization to support multiple keys and async locking
init_str = '''class GeminiStructuringPipeline:
    def __init__(self):
        # Configure Gemini API to handle multiple keys mapping
        keys_env = os.getenv("GEMINI_API_KEYS", os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))
        self.api_keys = [k.strip() for k in keys_env.split(",") if k.strip()]
        self.current_key_idx = 0
        
        if self.api_keys:
            genai.configure(api_key=self.api_keys[self.current_key_idx])

        self.model = genai.GenerativeModel('gemini-2.5-flash')
        import asyncio
        self.lock = asyncio.Lock()'''

text = re.sub(r'class GeminiStructuringPipeline:\s+def __init__\(self\):.*?self\.model = genai\.GenerativeModel\(\'gemini-2\.5-flash\'\)', init_str, text, flags=re.DOTALL)

# Replace the 429 quota exception handling block
error_logic_old = '''            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "Quota exceeded" in err_str or "429 Too Many Requests" in err_str:
                    wait_time = 35
                    spider.logger.warning(f"AI Quota exceeded. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries}) | {err_str[:150]}")
                    await asyncio.sleep(wait_time)'''

error_logic_new = '''            except Exception as e:
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
                            await asyncio.sleep(wait_time)'''

text = text.replace(error_logic_old, error_logic_new)

with open(r'D:\Projects\GrantIQ\Scapper_engine\scheme_scraper\pipelines.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Pipeline Patched for Multi-Keys Rotating!")
