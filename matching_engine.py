"""
GrantIQ - Scheme Matching Engine
Real-time company-to-scheme recommendation using multi-factor scoring
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
import time
from datetime import datetime
from typing import List, Dict, Optional

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GrantIQ Matching Engine", version="1.0")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "trace": traceback.format_exc()},
    )

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://vanshthaparprofessional_db_user:vansh14082005@grantiq.vedposr.mongodb.net/")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client['grantiq_db']
    # Test connection
    db.command('ping')
    logger.info("✅ MongoDB Connected")
except Exception as e:
    logger.error(f"❌ MongoDB Connection Failed: {e}")
    db = None

# ============= Pydantic Models =============

class LocationData(BaseModel):
    state: str = "National"
    scope: str = "national"

class CompanyProfile(BaseModel):
    name: str = "Unknown Company"
    industry: str
    business_stage: str
    annual_revenue_crores: float = 0.0
    location: Optional[LocationData] = LocationData()
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    registered_category: Optional[str] = None
    women_led: Optional[bool] = False
    export_focused: Optional[bool] = False

class MatchBreakdown(BaseModel):
    industry_match: float
    stage_match: float
    location_match: float
    revenue_match: float
    audience_match: float
    category_match: float

class RecommendationResult(BaseModel):
    rank: int
    scheme_name: str
    scheme_id: str
    source_url: str
    relevance_score: float
    match_breakdown: MatchBreakdown
    benefits: str
    eligibility_summary: str
    scheme_type: str
    execution_time_ms: float

class RecommendationResponse(BaseModel):
    status: str
    company_name: str
    total_matches: int
    recommendations: List[RecommendationResult]
    execution_time_ms: float

# ============= Core Matching Logic =============

class SchemeRecommender:
    def __init__(self, collection):
        self.collection = collection
        self.SCORE_WEIGHTS = {
            'industry': 0.35,
            'stage': 0.20,
            'location': 0.15,
            'revenue': 0.15,
            'audience': 0.10,
            'category': 0.05
        }
    
    def recommend(self, company: CompanyProfile) -> List[Dict]:
        """Main recommendation pipeline"""
        start_time = time.time()
        
        # Step 1: Fetch candidate schemes
        candidates = self._fetch_candidates(company)
        logger.info(f"Found {len(candidates)} candidate schemes")
        
        if not candidates:
            # Fallback - grab everything to score if filter was too strict
            if self.collection is not None:
                candidates = list(self.collection.find().limit(50))
            
            if not candidates:
                logger.warning(f"No candidates found for {company.industry} in {company.location.state}")
                return []
        
        # Step 2: Score each scheme
        scored_schemes = []
        for scheme in candidates:
            score = self._calculate_composite_score(company, scheme)
            if score >= 20:  # Minimum threshold lowered for testing
                breakdown = self._calculate_breakdown(company, scheme)
                scored_schemes.append({
                    'scheme': scheme,
                    'total_score': score,
                    'breakdown': breakdown
                })
        
        # Step 3: Sort by score (descending)
        scored_schemes.sort(key=lambda x: x['total_score'], reverse=True)
        logger.info(f"Scored {len(scored_schemes)} matching schemes")
        
        # Step 4: Format output (top 10)
        results = []
        for idx, item in enumerate(scored_schemes[:10], 1):
            benef = item['scheme'].get('benefits')
            elig = item['scheme'].get('eligibility')
            sc_type = item['scheme'].get('scheme_type')
            s_name = item['scheme'].get('name')
            s_url = item['scheme'].get('source_url') or item['scheme'].get('link')
            
            results.append({
                'rank': idx,
                'scheme_name': str(s_name or 'Unknown'),
                'scheme_id': str(item['scheme'].get('scheme_id') or item['scheme'].get('_id') or 'N/A'),
                'source_url': str(s_url or ''),
                'relevance_score': round(item['total_score'], 2),
                'match_breakdown': item['breakdown'],
                'benefits': str(benef or 'Not specified')[:250],
                'eligibility_summary': str(elig or 'Not specified')[:200],
                'scheme_type': str(sc_type or 'Unknown'),
                'execution_time_ms': round((time.time() - start_time) * 1000, 2)
            })
        
        return results
    
    def _fetch_candidates(self, company: CompanyProfile) -> List[Dict]:
        if self.collection is None:
            return []
        try:
            # Let's grab all schemes and score them all to avoid missing matches
            return list(self.collection.find({}).limit(400))
        except Exception as e:
            return []
        
        try:
            # Adjusted query logic for your myscheme_gov_in collection
            query = {
                "$or": [
                    {"industry_tags": {"$in": [company.industry, "All"]}},
                    {"standardized_industry": company.industry}
                ]
            }
            return list(self.collection.find(query).limit(100))
        except Exception as e:
            logger.error(f"Error fetching candidates: {e}")
            return []
    
    def _calculate_composite_score(self, company: CompanyProfile, scheme: Dict) -> float:
        """Step 2: Calculate weighted score (0-100)"""
        scores = {
            'industry': self._score_industry(company, scheme),
            'stage': self._score_stage(company, scheme),
            'location': self._score_location(company, scheme),
            'revenue': self._score_revenue(company, scheme),
            'audience': self._score_audience(company, scheme),
            'category': self._score_category(company, scheme)
        }
        
        final_score = sum(scores[key] * self.SCORE_WEIGHTS[key] for key in scores)
        return final_score
    
    def _score_industry(self, company: CompanyProfile, scheme: Dict) -> float:
        industry_tags = scheme.get('industry_tags') or []
        scheme_str = str(scheme).lower()
        if company.industry and company.industry.lower() in scheme_str: return 100.0
        if "all" in str(industry_tags).lower(): return 80.0
        
        # Give a base score if there are no strict industry limitations
        if not industry_tags: return 70.0
        
        # Otherwise penalize mismatched industries
        return 20.0
    
    def _score_stage(self, company: CompanyProfile, scheme: Dict) -> float:
        stages = (scheme.get('business_stages') or []) + (scheme.get('category_tags') or [])
        scheme_str = str(scheme).lower()
        if company.business_stage and company.business_stage.lower() in scheme_str: return 100.0
        
        if not stages: return 80.0
        return 40.0
    
    def _score_location(self, company: CompanyProfile, scheme: Dict) -> float:
        locations = scheme.get('location_tags') or []
        scheme_str = str(scheme).lower()
        if company.location and company.location.state and company.location.state.lower() in scheme_str: return 100.0
        if "national" in scheme_str or "central" in scheme_str: return 90.0
        if not locations: return 80.0
        return 30.0
    
    def _score_revenue(self, company: CompanyProfile, scheme: Dict) -> float:
        return 100.0 # Simplified for matching your scraped data format which lacks revenue bounds
    
    def _score_audience(self, company: CompanyProfile, scheme: Dict) -> float:
        scheme_str = str(scheme).lower()
        score = 50.0
        if company.women_led and 'women' in scheme_str: score += 40.0
        if company.business_stage == 'startup' and 'startup' in scheme_str: score += 30.0
        if company.export_focused and 'export' in scheme_str: score += 40.0
        if company.registered_category and company.registered_category.lower() in scheme_str: score += 20.0
        
        return min(100.0, score)
    
    def _score_category(self, company: CompanyProfile, scheme: Dict) -> float:
        return 80.0
    
    def _calculate_breakdown(self, company: CompanyProfile, scheme: Dict) -> Dict:
        return {
            'industry_match': round(self._score_industry(company, scheme), 1),
            'stage_match': round(self._score_stage(company, scheme), 1),
            'location_match': round(self._score_location(company, scheme), 1),
            'revenue_match': round(self._score_revenue(company, scheme), 1),
            'audience_match': round(self._score_audience(company, scheme), 1),
            'category_match': round(self._score_category(company, scheme), 1)
        }

# ============= API Endpoints =============

if db is not None:
    # Use myscheme_gov_in which contains your 22 scraped documents
    schemes_collection = db['myscheme_gov_in']
    recommender = SchemeRecommender(schemes_collection)
else:
    recommender = SchemeRecommender(None)

@app.post("/api/v1/recommend", response_model=RecommendationResponse)
async def get_recommendations(company: CompanyProfile):
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection failed")
        
        logger.info(f"Processing recommendations for {company.name} ({company.industry})")
        recommendations = recommender.recommend(company)
        exec_time = recommendations[0]['execution_time_ms'] if recommendations else 0
        
        return RecommendationResponse(
            status="success",
            company_name=company.name,
            recommendations=[
                RecommendationResult(**{
                    **rec,
                    'match_breakdown': MatchBreakdown(**rec['match_breakdown'])
                })
                for rec in recommendations
            ],
            total_matches=len(recommendations),
            execution_time_ms=float(exec_time)
        )
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error: {error_details}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    db_status = "connected" if db is not None else "disconnected"
    return {
        "status": "healthy",
        "service": "scheme-matcher",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/stats")
async def get_stats():
    try:
        total_schemes = db['myscheme_gov_in'].count_documents({}) if db is not None else 0
        return {
            "total_schemes_in_db": total_schemes,
            "algorithm_version": "1.0",
            "collection": "myscheme_gov_in",
            "score_weights": recommender.SCORE_WEIGHTS
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
