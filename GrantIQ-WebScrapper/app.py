import os
from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

MONGO_URL = os.getenv("MONGO_URL")

@app.route('/match-schemes', methods=['POST'])
def match_schemes():
    data = request.json
    if not data or 'business_description' not in data:
        return jsonify({"error": "Please provide 'business_description' in the raw JSON body"}), 400

    business_desc = data['business_description']
    
    try:
        client = MongoClient(MONGO_URL)
        db = client["government_schemes_db"]
        collection = db["detailed_schemes"]
        
        # We leverage the compound text index we created in scraper.py
        # Finding schemes where text matches keywords in the user's business description
        query = {"$text": {"$search": business_desc}}
        projection = {"score": {"$meta": "textScore"}, "_id": 0}
        
        results = collection.find(query, projection).sort([("score", {"$meta": "textScore"})]).limit(5)
        schemes = list(results)
        
        if not schemes:
            return jsonify({"message": "No matching schemes found for your profile.", "results": []}), 200
            
        return jsonify({"message": "Best matching schemes found", "results": schemes}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Start the backend API on port 5000
    app.run(debug=True, port=5000)
