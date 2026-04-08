import re

with open('matching_engine.py', 'r') as f:
    content = f.read()

# Update finding schemes to grab all regardless of industry if candidate list is small
new_fetch = """    def _fetch_candidates(self, company: CompanyProfile) -> List[Dict]:
        if self.collection is None:
            return []
        try:
            # Let's grab all schemes and score them all to avoid missing matches
            return list(self.collection.find({}).limit(400))
        except Exception as e:
            return []
"""
content = re.sub(r'    def _fetch_candidates\(self, company: CompanyProfile\) -> List\[Dict\]:.*?return \[\]\n', new_fetch, content, flags=re.DOTALL)

# Add more sophisticated scoring
new_score_industry = """    def _score_industry(self, company: CompanyProfile, scheme: Dict) -> float:
        industry_tags = scheme.get('industry_tags') or []
        scheme_str = str(scheme).lower()
        if company.industry and company.industry.lower() in scheme_str: return 100.0
        if "all" in str(industry_tags).lower(): return 80.0
        
        # Give a base score if there are no strict industry limitations
        if not industry_tags: return 70.0
        
        # Otherwise penalize mismatched industries
        return 20.0
"""
content = re.sub(r'    def _score_industry\(self, company: CompanyProfile, scheme: Dict\) -> float:.*?return 10.0\n', new_score_industry, content, flags=re.DOTALL)


new_score_stage = """    def _score_stage(self, company: CompanyProfile, scheme: Dict) -> float:
        stages = (scheme.get('business_stages') or []) + (scheme.get('category_tags') or [])
        scheme_str = str(scheme).lower()
        if company.business_stage and company.business_stage.lower() in scheme_str: return 100.0
        
        if not stages: return 80.0
        return 40.0
"""
content = re.sub(r'    def _score_stage\(self, company: CompanyProfile, scheme: Dict\) -> float:.*?return 40.0\n', new_score_stage, content, flags=re.DOTALL)

new_score_audience = """    def _score_audience(self, company: CompanyProfile, scheme: Dict) -> float:
        scheme_str = str(scheme).lower()
        score = 50.0
        if company.women_led and 'women' in scheme_str: score += 40.0
        if company.business_stage == 'startup' and 'startup' in scheme_str: score += 30.0
        if company.export_focused and 'export' in scheme_str: score += 40.0
        if company.registered_category and company.registered_category.lower() in scheme_str: score += 20.0
        
        return min(100.0, score)
"""
content = re.sub(r'    def _score_audience\(self, company: CompanyProfile, scheme: Dict\) -> float:.*?return score\n', new_score_audience, content, flags=re.DOTALL)

new_score_location = """    def _score_location(self, company: CompanyProfile, scheme: Dict) -> float:
        locations = scheme.get('location_tags') or []
        scheme_str = str(scheme).lower()
        if company.location and company.location.state and company.location.state.lower() in scheme_str: return 100.0
        if "national" in scheme_str or "central" in scheme_str: return 90.0
        if not locations: return 80.0
        return 30.0
"""

content = re.sub(r'    def _score_location\(self, company: CompanyProfile, scheme: Dict\) -> float:.*?return 0.0\n', new_score_location, content, flags=re.DOTALL)


with open('matching_engine.py', 'w') as f:
    f.write(content)
