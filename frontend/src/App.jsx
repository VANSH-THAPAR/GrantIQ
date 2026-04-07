import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Briefcase, Calendar, MapPin, 
  Users, BadgeIndianRupee, Rocket, FileBadge, 
  Search, ShieldCheck, Sparkles, ChevronRight, 
  AlertCircle, CheckCircle2, BookOpen, Globe, ArrowRight, Activity, ArrowLeft, MessageSquareText
} from 'lucide-react';

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
    e.preventDefault();
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

  // 1. Landing View
  const renderLanding = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-4 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl -z-10"
      />

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[10%] hidden md:flex bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
      >
        <BadgeIndianRupee className="w-8 h-8 text-emerald-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-[10%] hidden md:flex bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
      >
        <Rocket className="w-8 h-8 text-blue-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/4 right-[15%] hidden md:flex bg-white p-4 rounded-2xl shadow-xl border border-slate-100"
      >
        <Briefcase className="w-8 h-8 text-indigo-500" />
      </motion.div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-5 rounded-3xl shadow-2xl border border-blue-500/30 mb-8 inline-flex relative group cursor-default"
      >
        <div className="absolute inset-0 bg-white/20 rounded-3xl blur group-hover:blur-md transition-all" />
        <Sparkles className="text-white w-12 h-12 relative z-10" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 relative"
      >
        Unlock Growth with <br/>
        <span className="relative">
          <span className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full" />
          <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">GrantIQ</span>
        </span>
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
      >
        Your AI-powered scheme matching engine. Tell us who you are and what challenges you're facing, and we'll connect you directly to the best government grants and provisions.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col sm:flex-row items-center gap-6"
      >
        <button 
          onClick={startWizard}
          className="bg-slate-900 hover:bg-black text-white text-lg font-bold px-10 py-5 rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center gap-3 group"
        >
          Start Matching
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-all" />
        </button>
        
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 bg-white/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> AI Powered
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-500" /> 500+ Schemes
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  // 2. Wizard View
  const renderWizard = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="max-w-3xl mx-auto mt-12 w-full px-4 relative z-10"
    >
      <div className="mb-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold text-slate-900 tracking-tight"
        >
          Your Company DNA
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-slate-500 mt-3 text-base font-medium"
        >
          Let's tailor the government engine exactly to your business.
        </motion.p>
        
        {/* Progress Bar & Steps indicator */}
        <div className="relative mt-8">
          <div className="w-full bg-slate-200/50 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-slate-200 shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between mt-3 px-2">
            {[1, 2, 3].map((num) => (
              <span key={num} className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step >= num ? 'text-indigo-600' : 'text-slate-400'}`}>
                Step {num}
              </span>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden relative"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <form onSubmit={startDashboard} className="p-8 sm:p-12 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 50, position: 'absolute', width: '100%' }} 
                animate={{ opacity: 1, x: 0, position: 'relative' }} 
                exit={{ opacity: 0, x: -50, position: 'absolute' }} 
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-blue-100/50 p-3 rounded-xl"><Building2 className="text-blue-600 w-6 h-6" /></div>
                  <h3 className="text-2xl font-bold text-slate-800">Core Identity</h3>
                </div>

                <div className="group">
                  <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Company Name</label>
                  <input type="text" required value={profile.name} onChange={(e) => handleInputChange('name', e.target.value)} 
                    className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300"
                    placeholder="e.g. Reliance Industries"
                  />
                </div>
                
                <div className="group">
                  <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Industry Vertical</label>
                  <input type="text" required value={profile.industry} onChange={(e) => handleInputChange('industry', e.target.value)} 
                    className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300"
                    placeholder="e.g. Manufacturing, Agriculture, IT"
                  />
                </div>
                
                <div className="group">
                  <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Entity Type</label>
                  <div className="relative">
                    <select value={profile.registered_category} onChange={(e) => handleInputChange('registered_category', e.target.value)} 
                      className="w-full appearance-none bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 outline-none transition-all shadow-sm cursor-pointer group-hover:border-slate-300"
                    >
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 50, position: 'absolute', width: '100%' }} 
                animate={{ opacity: 1, x: 0, position: 'relative' }} 
                exit={{ opacity: 0, x: -50, position: 'absolute' }} 
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-100/50 p-3 rounded-xl"><Activity className="text-emerald-600 w-6 h-6" /></div>
                  <h3 className="text-2xl font-bold text-slate-800">Scale & Stage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Business Stage</label>
                    <div className="relative">
                      <select value={profile.business_stage} onChange={(e) => handleInputChange('business_stage', e.target.value)} 
                        className="w-full appearance-none bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 outline-none transition-all shadow-sm cursor-pointer group-hover:border-slate-300"
                      >
                        <option value="ideation">Ideation</option>
                        <option value="validation">Validation</option>
                        <option value="startup">Startup / Early Traction</option>
                        <option value="scaling">Scaling</option>
                        <option value="mature">Mature</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide flex justify-between">
                      Revenue 
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black max-w-fit">Crores (₹)</span>
                    </label>
                    <input type="number" step="0.1" min="0" required value={profile.annual_revenue_crores} onChange={(e) => handleInputChange('annual_revenue_crores', parseFloat(e.target.value))} 
                      className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300 font-mono"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Team Size / Employees</label>
                    <input type="number" min="1" required value={profile.employee_count} onChange={(e) => handleInputChange('employee_count', parseInt(e.target.value))} 
                      className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300 font-mono"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Founded Year</label>
                    <input type="number" min="1900" max={new Date().getFullYear()} required value={profile.founded_year} onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value))} 
                      className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: 50, position: 'absolute', width: '100%' }} 
                animate={{ opacity: 1, x: 0, position: 'relative' }} 
                exit={{ opacity: 0, x: -50, position: 'absolute' }} 
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-purple-100/50 p-3 rounded-xl"><Globe className="text-purple-600 w-6 h-6" /></div>
                  <h3 className="text-2xl font-bold text-slate-800">Geography & Indicators</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">Operation Scope</label>
                    <div className="relative">
                      <select value={profile.location.scope} onChange={(e) => handleNestedChange('location', 'scope', e.target.value)} 
                        className="w-full appearance-none bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 p-4 outline-none transition-all shadow-sm cursor-pointer group-hover:border-slate-300"
                      >
                        <option value="national">National</option>
                        <option value="state">State Level</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 block tracking-wide">HQ State</label>
                    <input type="text" required value={profile.location.state} onChange={(e) => handleNestedChange('location', 'state', e.target.value)} 
                      className="w-full bg-slate-50/50 border-2 border-slate-200 text-base rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 p-4 outline-none transition-all shadow-sm group-hover:border-slate-300"
                      placeholder="e.g. Maharashtra, Delhi"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <label className={`relative flex items-center justify-between cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${profile.women_led ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 bg-slate-50/30 hover:border-purple-300 hover:bg-slate-100/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${profile.women_led ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-slate-800 block">Women-Led Enterprise</span>
                        <span className="text-sm text-slate-500 font-medium">Majority owned or operated by women</span>
                      </div>
                    </div>
                    <div className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${profile.women_led ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-slate-300'}`}>
                      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${profile.women_led ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                    {/* Hidden actual checkbox */}
                    <input type="checkbox" className="sr-only" checked={profile.women_led} onChange={(e) => handleInputChange('women_led', e.target.checked)} />
                  </label>

                  <label className={`relative flex items-center justify-between cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${profile.export_focused ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 bg-slate-50/30 hover:border-purple-300 hover:bg-slate-100/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${profile.export_focused ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-slate-800 block">Export Focused</span>
                        <span className="text-sm text-slate-500 font-medium">Primarily exporting goods or services</span>
                      </div>
                    </div>
                    <div className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${profile.export_focused ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-slate-300'}`}>
                      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${profile.export_focused ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                    {/* Hidden actual checkbox */}
                    <input type="checkbox" className="sr-only" checked={profile.export_focused} onChange={(e) => handleInputChange('export_focused', e.target.checked)} />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100 relative">
            {step > 1 ? (
              <button type="button" onClick={prevStep} 
                className="text-slate-500 hover:text-slate-800 font-bold text-base flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all focus:ring-2 focus:ring-slate-200 outline-none"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            ) : <div/>}

            {step < 3 ? (
              <button type="button" onClick={nextStep} 
                className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-slate-900/10 transition-all flex items-center gap-3 hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-900/20 outline-none"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-600/30 outline-none group"
              >
                Finish Setup <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  // 3. Dashboard View
  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-8 w-full px-4"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-lg shadow-slate-900/20">
          {profile.name.substring(0, 2)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome, {profile.name}!</h2>
          <p className="text-slate-500 text-sm font-medium">Your profile is configured and ready. Tell us what you need help with right now.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <form onSubmit={handleSearch} className="p-6">
          <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <MessageSquareText className="w-4 h-4 text-blue-500" /> Current Challenge or Need
          </label>
          <div className="relative">
            <textarea
              required
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g. 'We need a loan to buy new manufacturing machinery' or 'Looking for tax benefits for hiring more women employees...'"
              className="w-full min-h-32 bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 outline-none resize-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isSearching || !problemText.trim()}
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? <span className="animate-pulse">Searching...</span> : <>Match Schemes <Search className="w-4 h-4" /></>}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-500"/> Our AI matches this context directly against the Government database.</p>
        </form>
      </div>

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
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20 overflow-x-hidden">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-white pointer-events-none" />

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-sm border border-blue-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">GrantIQ</h1>
          </div>
          {view === 'dashboard' && (
            <button onClick={() => setView('wizard')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
              Edit Profile
            </button>
          )}
        </div>
      </nav>

      {/* Primary View Routing */}
      <AnimatePresence mode="wait">
        {view === 'landing' && <motion.div key="landing">{renderLanding()}</motion.div>}
        {view === 'wizard' && <motion.div key="wizard">{renderWizard()}</motion.div>}
        {view === 'dashboard' && <motion.div key="dashboard">{renderDashboard()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}