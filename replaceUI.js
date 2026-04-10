const fs = require('fs');
appPath = 'C:/Vansh-hackathon-work/GrantIQ/frontend/src/App.jsx';
let content = fs.readFileSync(appPath, 'utf8');

const startTag = '  // 3. Dashboard View';
const endTag = '  return (\n    <div className="min-h-screen bg-slate-50/50  text-slate-900 pb-20 overflow-x-hidden">';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find start (' + startIndex + ') or end tag (' + endIndex + ')');
  process.exit(1);
}

const newUI = `  // 3. Dashboard View
  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-[#f7f9fb] text-[#2a3439] overflow-x-hidden font-body selection:bg-[#6ffbbe]/30">
        {/* TopNavBar */}
        <nav className="fixed top-[0px] w-full z-[100] bg-white/80 backdrop-blur-xl shadow-[0px_4px_20px_rgba(42,52,57,0.06)] flex justify-between items-center px-8 h-16">
          <div className="flex items-center gap-8 text-[#006c49]">
            <span className="text-xl font-bold tracking-tight">GrantIQ</span>
            <div className="relative items-center hidden sm:flex text-slate-800">
              <Search className="absolute left-3 text-[#a9b4b9] w-5 h-5" />
              <input 
                className="pl-10 pr-4 py-2 bg-[#f0f4f7] border-none rounded-xl w-80 text-sm focus:ring-2 focus:ring-[#6ffbbe] outline-none" 
                placeholder="Search schemes, eligibility, or sectors..." 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 transition-colors rounded-lg text-[#566166]">
                <Activity className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/onboard')} className="p-2 hover:bg-slate-50 transition-colors rounded-lg text-[#566166] hidden sm:block">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-full border border-[#d9e4ea] shadow-sm bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
              {profile.name.charAt(0) || 'U'}
            </div>
          </div>
        </nav>

        {/* SideNavBar */}
        <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2 pt-20 hidden md:flex border-r border-slate-100 z-[90]">
          <div className="mb-6 px-4">
            <h2 className="font-bold text-[#006c49]">GrantIQ Admin</h2>
            <p className="text-xs text-[#a9b4b9] font-medium">Management Portal</p>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-[#566166] hover:text-[#006c49] hover:bg-white transition-all hover:shadow-sm hover:translate-x-1 duration-200 rounded-lg">
              <Activity className="w-5 h-5" />
              <span className="font-semibold text-sm">Dashboard</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 bg-white text-[#006c49] font-bold shadow-sm rounded-lg transition-transform hover:translate-x-1 duration-200 border border-slate-100 w-full text-left">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold text-sm">Schemes</span>
            </button>
            <button onClick={() => navigate('/onboard')} className="flex items-center gap-3 px-4 py-2.5 text-[#566166] hover:text-[#006c49] hover:bg-white transition-all hover:shadow-sm hover:translate-x-1 duration-200 rounded-lg">
              <Settings className="w-5 h-5" />
              <span className="font-semibold text-sm">Profile</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="md:ml-64 pt-24 pb-12 px-6 sm:px-10 min-h-screen bg-[#f7f9fb]">
          
          {isSearching && (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(42,52,57,0.06)] mb-8 animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-4 border-[#f0f4f7] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#006c49] rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="w-6 h-6 text-[#006c49] animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-[#2a3439] mb-2">Analyzing your profile...</h3>
              <p className="text-[#566166] font-medium text-center max-w-md">Our AI is matching your challenge directly against the Government database.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-[#fff7f6] border border-[#fe8983] rounded-xl text-[#9f403d] flex items-start gap-3 shadow-sm mb-8 animate-in fade-in">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <header className="mb-10">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#2a3439] mb-3 md:pt-0 pt-10">Available Grant Schemes</h1>
                <p className="text-[#566166] max-w-2xl text-base leading-relaxed">Discover and apply for government-backed financial instruments designed to scale your business operations and innovation.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#d9e4ea] rounded-xl text-sm font-semibold text-[#2a3439] hover:bg-[#c7d5ee] transition-colors shadow-sm">
                  <Settings className="w-4 h-4" />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6ffbbe] text-[#005e3f] rounded-xl text-sm font-bold shadow-[0_2px_10px_rgba(111,251,190,0.4)] hover:shadow-[0_4px_15px_rgba(111,251,190,0.6)] hover:-translate-y-0.5 transition-all">
                  <Activity className="w-4 h-4" />
                  Recommended
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 mt-8 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
              <span className="px-5 py-2 bg-[#006c49] text-[#e1ffec] rounded-full text-xs font-bold whitespace-nowrap cursor-default shadow-sm border border-[#006c49]">All Schemes ({results.length})</span>
              <span className="px-5 py-2 bg-white border border-[#d9e4ea] text-[#566166] rounded-full text-xs font-semibold hover:border-[#6ffbbe] hover:text-[#006c49] hover:shadow-sm cursor-pointer whitespace-nowrap transition-all">{profile.industry || 'Tech'}</span>
              <span className="px-5 py-2 bg-white border border-[#d9e4ea] text-[#566166] rounded-full text-xs font-semibold hover:border-[#6ffbbe] hover:text-[#006c49] hover:shadow-sm cursor-pointer whitespace-nowrap transition-all">{profile.registered_category || 'General'}</span>
              <span className="px-5 py-2 bg-white border border-[#d9e4ea] text-[#566166] rounded-full text-xs font-semibold hover:border-[#6ffbbe] hover:text-[#006c49] hover:shadow-sm cursor-pointer whitespace-nowrap transition-all">Financial Support</span>
              <span className="px-5 py-2 bg-white border border-[#d9e4ea] text-[#566166] rounded-full text-xs font-semibold hover:border-[#6ffbbe] hover:text-[#006c49] hover:shadow-sm cursor-pointer whitespace-nowrap transition-all">R&D Grants</span>
            </div>
          </header>

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {results.map((scheme, idx) => (
                <div key={idx} className="group relative bg-[#ffffff] rounded-2xl p-8 shadow-[0px_4px_20px_rgba(42,52,57,0.06)] hover:shadow-[0px_12px_40px_rgba(42,52,57,0.08)] transition-all duration-300 flex flex-col border border-transparent hover:border-[#6ffbbe]/20">
                  
                  {scheme.keywordScore > 0 && (
                    <div className="absolute top-5 right-5 flex gap-2 z-10">
                      <span className="bg-[#eef9cd] text-[#565f3e] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-[#eef9cd]/50">
                        <Sparkles className="w-3 h-3" />
                        High Intent Match
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#6ffbbe] flex items-center justify-center text-[#006c49] flex-shrink-0 shadow-sm">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2 pr-28">
                        <span className="px-2.5 py-0.5 bg-[#d5e3fd] text-[#324054] text-[10px] font-bold rounded-md tracking-wide">FINANCIAL SUPPORT</span>
                        <span className="px-2.5 py-0.5 bg-[#f0f4f7] border border-[#d9e4ea] text-[#566166] text-[10px] font-bold rounded-md uppercase tracking-wide">{scheme.scheme_type || 'Funding'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#2a3439] pr-5 leading-tight">{scheme.scheme_name}</h3>
                      <div className="flex items-center gap-1.5 text-[#566166] text-xs mt-2 font-medium">
                        <MapPin className="w-3 h-3 text-[#a9b4b9]" />
                        {profile.location?.state || 'Pan-India'}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#566166] leading-relaxed mb-6 block min-h-[4rem]">
                     {scheme.benefits && scheme.benefits.length > 200 ? scheme.benefits.substring(0, 200) + '...' : scheme.benefits}
                     <a href={scheme.source_url || '#'} target="_blank" rel="noreferrer" className="text-[#006c49] font-bold hover:text-[#005f40] transition-colors ml-1.5 inline-flex items-center gap-0.5">
                       View Full Details <ArrowRight className="w-3 h-3 ml-1" />
                     </a>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8 pt-5 border-t border-[#f0f4f7]">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#a9b4b9] uppercase tracking-widest mb-3">Key Benefits</h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5 text-sm text-[#2a3439] leading-snug">
                          <CheckCircle2 className="text-[#006c49] w-4 h-4 opacity-90 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{scheme.benefits ? scheme.benefits.split('.')[0] : 'Accelerate Growth'}</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[#2a3439] leading-snug">
                          <CheckCircle2 className="text-[#006c49] w-4 h-4 opacity-90 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">Direct processing integration</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#a9b4b9] uppercase tracking-widest mb-3">Eligibility</h4>
                      <p className="text-sm text-[#2a3439] leading-snug font-medium">
                        {scheme.eligibility_summary && scheme.eligibility_summary.length > 90 
                          ? scheme.eligibility_summary.substring(0, 90) + '...' 
                          : (scheme.eligibility_summary || 'Business entities running actively.')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 mt-auto">
                    <h4 className="text-[11px] font-bold text-[#a9b4b9] uppercase tracking-widest mb-4">Application Steps</h4>
                    <div className="flex items-center w-full max-w-sm mx-auto">
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#006c49] text-[#e1ffec] flex items-center justify-center text-xs font-bold ring-4 ring-[#6ffbbe]/30 shadow-sm relative z-10">1</div>
                        <span className="text-[10px] mt-2.5 font-bold text-[#2a3439] uppercase tracking-wide">Register</span>
                      </div>
                      <div className="h-[2px] flex-1 bg-[#6ffbbe]/60 -mx-4 z-0"></div>
                      <div className="flex flex-col items-center flex-1 opacity-60">
                        <div className="w-8 h-8 rounded-full bg-[#d9e4ea] border border-[#a9b4b9]/30 text-[#455367] flex items-center justify-center text-xs font-bold relative z-10">2</div>
                        <span className="text-[10px] mt-2.5 font-bold text-[#566166] uppercase tracking-wide">Verify</span>
                      </div>
                      <div className="h-[2px] flex-1 bg-[#f0f4f7] -mx-4 z-0"></div>
                      <div className="flex flex-col items-center flex-1 opacity-60">
                        <div className="w-8 h-8 rounded-full bg-[#d9e4ea] border border-[#a9b4b9]/30 text-[#455367] flex items-center justify-center text-xs font-bold relative z-10">3</div>
                        <span className="text-[10px] mt-2.5 font-bold text-[#566166] uppercase tracking-wide">Lend</span>
                      </div>
                    </div>
                    <div className="text-center mt-5">
                      <a className="text-xs font-bold text-[#a9b4b9] hover:text-[#006c49] transition-colors flex items-center justify-center gap-1 cursor-pointer">
                          View Full Process
                          <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-auto border-t border-[#f0f4f7] pt-6 pb-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleAutoFill(idx); }}
                      className="flex-[2] bg-gradient-to-br from-[#006c49] to-[#004930] text-[#e1ffec] py-3.5 px-6 rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(0,108,73,0.3)] hover:shadow-[0_6px_20px_rgba(0,108,73,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#004930] group/btn"
                    >
                      <Activity className="w-5 h-5 group-hover/btn:animate-pulse" />
                      Fill through AI Agent
                    </button>
                    <a 
                      href={scheme.source_url || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-[1] py-3.5 px-6 bg-[#f0f4f7] text-[#455367] font-bold text-sm rounded-xl hover:bg-[#d9e4ea] transition-colors border border-[#d9e4ea] hover:border-[#a9b4b9] flex items-center justify-center gap-2 text-center shadow-sm"
                    >
                      View Scheme
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    );
  };
`

content = content.substring(0, startIndex) + newUI + content.substring(endIndex);
fs.writeFileSync(appPath, content);
console.log('App.jsx UI Successfully updated without changing mechanics.');
