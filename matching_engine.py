"""
GrantIQ - Scheme Matching Engine
Real-time company-to-scheme recommendation using multi-factor scoring
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
import time
from datetime import datetime
from typing import List, Dict, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Initializing NLP Semantic AI Model (all-MiniLM-L6-v2) - this takes a few seconds...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

app = FastAPI(title="GrantIQ Matching Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://grantiq-chitkaraverse.netlify.app", "*"],
    allow_credentials=False,
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = exc.body
    if isinstance(body, bytes):
        body = body.decode("utf-8")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body},
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
    db = client['government_schemes_db']
    # Test connection
    db.command('ping')
    logger.info("âœ… MongoDB Connected")
except Exception as e:
    logger.error(f"âŒ MongoDB Connection Failed: {e}")
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
    semantic_match: float

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
            'industry': 0.25,
            'semantic': 0.25,
            'stage': 0.15,
            'location': 0.15,
            'revenue': 0.10,
            'audience': 0.10
        }
        
    def _get_company_text(self, company: CompanyProfile) -> str:
        """Create a holistic text representation of the company for AI matching."""
        tags = []
        if company.women_led: tags.append("Women-led enterprise")
        if company.export_focused: tags.append("Export-Oriented business")
        if company.registered_category: tags.append(f"Founder Category: {company.registered_category}")
        tags_str = ", ".join(tags)
        return f"A {company.business_stage} stage company in the {company.industry} sector located in {company.location.state}. Annual revenue: {company.annual_revenue_crores} crores. {tags_str}"
        
    def _get_scheme_text(self, scheme: Dict) -> str:
        """Combine scheme title and details for embedding."""
        return f"{scheme.get('name', '')}. {scheme.get('details', '')} {scheme.get('benefits', '')}"
    
    def recommend(self, company: CompanyProfile) -> List[Dict]:
        """Main recommendation pipeline"""
        start_time = time.time()
        
        # Step 1: Fetch candidate schemes
        candidates = self._fetch_candidates(company)
        logger.info(f"Found {len(candidates)} candidate schemes")
        
        if not candidates:
            # Fallback - grab everything to score if filter was too strict
            if self.collection is not None:
                try:
                    candidates = list(self.collection.find().limit(50))
                except Exception as ex:
                    logger.error(f"Fallback grab failed: {ex}")
            
            if not candidates:
                logger.warning(f"No candidates found for {company.industry} in {company.location.state}")
                return []

        # --- ML Semantic Preparation ---
        # Generate the holistic company vector embedding just once
        company_text = self._get_company_text(company)
        try:
            company_vector = embedder.encode(company_text).reshape(1, -1)
        except Exception as e:
            logger.error(f"Could not encode company semantic vector: {e}")
            company_vector = None
        # -------------------------------
        
        # Step 2: Score each scheme
        scored_schemes = []
        for scheme in candidates:
            # Calculate Semantic embedding similarity
            semantic_score = 0.0
            if company_vector is not None:
                scheme_text = self._get_scheme_text(scheme)
                try:
                    scheme_vec = embedder.encode(scheme_text).reshape(1, -1)
                    cos_sim = cosine_similarity(company_vector, scheme_vec)[0][0]
                    # Scale cosine similarity (0 to 1 roughly, although can be -1) to 0-100
                    semantic_score = max(0.0, float(cos_sim) * 100.0)
                except Exception:
                    pass
                    
            score = self._calculate_composite_score(company, scheme, semantic_score)
            if score >= 5:  # Minimum threshold lowered heavily so schemes don't filter out
                breakdown = self._calculate_breakdown(company, scheme, semantic_score)
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
            logger.error(f"Error fetching ALL candidates: {e}")
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
    
    def _calculate_composite_score(self, company: CompanyProfile, scheme: Dict, semantic_score: float) -> float:
        """Step 2: Calculate weighted score (0-100)"""
        scores = {
            'industry': self._score_industry(company, scheme),
            'stage': self._score_stage(company, scheme),
            'location': self._score_location(company, scheme),
            'revenue': self._score_revenue(company, scheme),
            'audience': self._score_audience(company, scheme),
            'semantic': semantic_score
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
    
    def _calculate_breakdown(self, company: CompanyProfile, scheme: Dict, semantic_score: float) -> Dict:
        return {
            'industry_match': round(self._score_industry(company, scheme), 1),
            'stage_match': round(self._score_stage(company, scheme), 1),
            'location_match': round(self._score_location(company, scheme), 1),
            'revenue_match': round(self._score_revenue(company, scheme), 1),
            'audience_match': round(self._score_audience(company, scheme), 1),
            'semantic_match': round(semantic_score, 1)
        }

# ============= API Endpoints =============

if db is not None:
    # Use detailed_schemes which contains your scraped documents
    schemes_collection = db['detailed_schemes']
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

class ChatRequest(BaseModel):
    question: str

@app.post("/api/v1/chat")
async def chat_with_context(req: ChatRequest):
    try:
        context_file = os.path.join(os.path.dirname(__file__), "context.txt")
        if not os.path.exists(context_file):
            return {"answer": "Context file not found."}
            
        with open(context_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Split logic: simple paragraph splitting
        chunks = [p.strip() for p in content.split('\n') if len(p.strip()) > 10]
        
        # Compute embeddings
        q_emb = embedder.encode([req.question.lower()])
        c_embs = embedder.encode([c.lower() for c in chunks])
        
        # Calculate similarity
        scores = cosine_similarity(q_emb, c_embs)[0]
        best_idx = int(np.argmax(scores))
        best_score = float(scores[best_idx])
        
        logger.info(f"Chat query: '{req.question}' | Best score: {best_score}")
        
        if best_score > 0.15:
            # We found a decent match in the business/scheme context
            return {"answer": chunks[best_idx], "score": best_score}
        else:
            return {"answer": "I can only answer questions related to your business and scheme context.", "score": best_score}
            
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"answer": "An error occurred while processing your question."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

