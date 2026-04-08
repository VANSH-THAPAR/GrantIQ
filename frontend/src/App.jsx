import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Briefcase, Calendar, MapPin, 
  Users, BadgeIndianRupee, Rocket, FileBadge, 
  Search, ShieldCheck, Sparkles, ChevronRight, 
  AlertCircle, CheckCircle2, BookOpen, Globe, ArrowRight, Activity, ArrowLeft, MessageSquareText, Settings
} from 'lucide-react';
import Wizard from './pages/Wizard';
import LandingPage from './pages/landing page/landingpage';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'wizard' | 'dashboard'
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [problemText, setProblemText] = useState('');

  const [profile, setProfile] = useState({
    name: 'Digimantra',
    industry: 'Software',
    business_stage: 'startup',
    annual_revenue_crores: 2.5,
    location: {
      state: 'National',
      scope: 'national'
    },
    founded_year: 2019,
    employee_count: 25,
    registered_category: 'Private Limited',
    women_led: false,
    export_focused: false
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const startWizard = () => setView('wizard');

  const startDashboard = (e) => {
    e?.preventDefault();
    if (!profile.name.trim()) {
      setError("Please enter your company name.");
      return;
    }
    setView('dashboard');
  };

  const calculateKeywordScore = (scheme, keywords) => {
    const textContext = `${scheme.scheme_name} ${scheme.benefits} ${scheme.eligibility_summary}`.toLowerCase();
    return keywords.reduce((score, kw) => textContext.includes(kw) ? score + 1 : score, 0);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!problemText.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/v1/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error('Failed to fetch from backend.');

      const data = await response.json();
      let recs = data.recommendations || [];
      
      // Perform client-side semantic sorting based on problem text keywords
      // e.g. "loans", "funding", "machinery"
      const rawKeywords = problemText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const importantKeywords = new Set(rawKeywords); // Avoid duplicates
      
      const scoredRecs = recs.map(r => ({
        ...r,
        keywordScore: calculateKeywordScore(r, Array.from(importantKeywords))
      }));

      // Sort primarily by keyword match on problem text, then by backend relevance_score
      scoredRecs.sort((a, b) => {
        if (b.keywordScore !== a.keywordScore) return b.keywordScore - a.keywordScore;
        return b.relevance_score - a.relevance_score;
      });

      setResults(scoredRecs);
      
      if(scoredRecs.length === 0) {
        setError("No matching schemes found for your profile.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch matching schemes. Please ensure the backend is running (`python matching_engine.py`) on port 8000.");
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (view === 'dashboard' && problemText && results.length === 0 && !isSearching) {
      handleSearch();
    }
  }, [view, problemText]);

  // 1. Landing View
  const renderLanding = () => (
    <LandingPage onStart={startWizard} />
  );

  // 2. Wizard View
  const renderWizard = () => {
    return <Wizard onSuccess={(data) => {
      if (data) {
        setProfile({
          name: data.companyName,
          industry: data.industry,
          business_stage: data.stage,
          annual_revenue_crores: parseFloat(data.revenue) || 0,
          location: {
            state: data.hqState,
            scope: data.operationScope
          },
          founded_year: parseInt(data.foundedYear) || new Date().getFullYear(),
          employee_count: parseInt(data.teamSize) || 0,
          registered_category: data.entityType,
          women_led: data.womenLed,
          export_focused: data.exportFocused
        });
        setProblemText(data.challenge);
      }
      setView('dashboard');
    }} />;
  };

  // 3. Dashboard View
  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-[#F7F6F2]  text-[#111111] overflow-x-hidden selection:bg-[#F4C84A]/30">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#F4C84A]" />
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#F4C84A]/5 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#F4C84A]/5 blur-3xl" />
        </div>

        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-[#F7F6F2]/80 backdrop-blur-xl border-b border-[#E5E5E5] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#F4C84A] p-2.5 rounded-xl shadow-[0_4px_14px_rgba(244,200,74,0.3)] border border-[#F4C84A]">
                <Activity className="w-7 h-7 text-[#111111]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#111111]">Grant<span className="text-[#F4C84A]">IQ</span></h1>
                <p className="text-xs font-semibold tracking-widest text-[#6B7280] uppercase">Opportunity Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('wizard')}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#111111] bg-[#F9F8F4] px-4 py-2 rounded-xl border border-[#E5E5E5] hover:border-[#F4C84A]/50 hover:bg-[#FFFFFF] transition-all"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-[#E5E5E5]">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-[#111111]">{profile.name}</div>
                  <div className="text-xs font-medium text-[#F4C84A]">{profile.business_stage} Stage</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#111111] text-[#FFFFFF] shadow-sm border-2 border-[#F4C84A] flex items-center justify-center font-bold text-lg">
                  {profile.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-8 w-full px-4"
        >

          {isSearching && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-8 animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing your profile...</h3>
              <p className="text-slate-500 font-medium text-center max-w-md">Our AI is matching your challenge directly against the Government database.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-3 shadow-sm mb-8 animate-in fade-in">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Relevant Schemes ({results.length})
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sorted by Intent</span>
              </div>

              <div className="space-y-4">
                {results.map((scheme, idx) => (
                  <div key={idx} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 opacity-60 ${scheme.keywordScore > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />

                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className={`flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl border ${scheme.keywordScore > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="text-center">
                          <span className={`block text-2xl font-black leading-none ${scheme.keywordScore > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {Math.round(scheme.relevance_score)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Score</span>
                        </div>
                      </div>

                      <div className="flex-grow space-y-2.5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="w-3.5 h-3.5" /> {scheme.scheme_type || 'General Scheme'}
                            {scheme.keywordScore > 0 && <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">High Intent Match</span>}
                          </p>
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {scheme.scheme_name}
                          </h4>
                        </div>
                        
                        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-100 text-sm space-y-3">
                          <p className="text-slate-600 leading-relaxed text-sm">
                            <strong className="text-slate-800">Benefits: </strong> {scheme.benefits}
                          </p>
                          <p className="text-slate-600 leading-relaxed text-sm">
                            <strong className="text-slate-800">Eligibility: </strong> {scheme.eligibility_summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <a href={scheme.source_url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-white hover:bg-blue-600 px-5 py-2.5 rounded-lg transition-colors border border-blue-100 hover:border-transparent ml-auto shadow-sm">
                        Apply on MyScheme <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50  text-slate-900 pb-20 overflow-x-hidden">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-white pointer-events-none" />

      {/* Primary View Routing */}
      <AnimatePresence mode="wait">
        {view === 'landing' && <motion.div key="landing">{renderLanding()}</motion.div>}
        {view === 'wizard' && <motion.div key="wizard">{renderWizard()}</motion.div>}
        {view === 'dashboard' && <motion.div key="dashboard">{renderDashboard()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}