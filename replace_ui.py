import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_pattern = r'  // 3\. Dashboard View.*?const renderDashboard = \(\) => \{'
end_pattern = r'  // renderLanding' # find what follows renderDashboard to make a safe cut, or we can use regex to match matching brackets.

# It's safer to split by known substrings
start_marker = "  // 3. Dashboard View"
end_marker = "  return (\n    <div className=\"min-h-screen"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

new_ui = """  // 3. Dashboard View
  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-[#f7f9fb] text-[#2a3439] overflow-x-hidden font-body selection:bg-[#6ffbbe]/30">
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0px_4px_20px_rgba(42,52,57,0.06)] flex justify-between items-center px-8 h-16">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-[#006c49]">GrantIQ</span>
            <div className="relative items-center hidden sm:flex">
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
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 transition-colors rounded-lg text-slate-500">
                <Activity className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-50 transition-colors rounded-lg text-slate-500 hidden sm:block">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className="w-8 h-8 rounded-full border border-[#d9e4ea] shadow-sm bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
              {profile.name.charAt(0)}
            </div>
          </div>
        </nav>

        {/* SideNavBar */}
        <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2 pt-20 hidden md:flex border-r border-slate-100 z-40">
          <div className="mb-6 px-4">
            <h2 className="font-bold text-[#006c49]">GrantIQ Admin</h2>
            <p className="text-xs text-slate-500">Management Portal</p>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-2.5 text-[#566166] hover:text-[#006c49] transition-transform hover:translate-x-1 duration-200">
              <Activity className="w-5 h-5" />
              <span className="font-semibold text-sm">Dashboard</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 bg-white text-[#006c49] font-bold shadow-sm rounded-lg transition-transform hover:translate-x-1 duration-200 border border-slate-100 w-full text-left">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold text-sm">Schemes</span>
            </button>
            <button onClick={() => navigate('/onboard')} className="flex items-center gap-3 px-4 py-2.5 text-[#566166] hover:text-[#006c49] transition-transform hover:translate-x-1 duration-200 w-full text-left">
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
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
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

          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#2a3439] mb-2 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-[#006c49] inline-block" /> Available Grant Schemes
                </h1>
                <p className="text-[#566166] max-w-2xl text-sm leading-relaxed">Discover and apply for government-backed financial instruments expressly designed for your organizational stage.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#d9e4ea] rounded-lg text-sm font-medium text-[#2a3439] hover:bg-[#c7d5ee] transition-colors">
                  <Settings className="w-4 h-4" />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#6ffbbe] text-[#005e3f] rounded-lg text-sm font-bold shadow-sm hover:opacity-90">
                  <Activity className="w-4 h-4" />
                  Recommended
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
              <span className="px-4 py-1.5 bg-[#006c49] text-[#e1ffec] rounded-full text-xs font-bold whitespace-nowrap cursor-default">All Schemes ({results.length})</span>
              <span className="px-4 py-1.5 bg-white border border-[#a9b4b9]/30 text-[#566166] rounded-full text-xs font-medium hover:border-[#6ffbbe]/50 cursor-pointer whitespace-nowrap">{profile.industry}</span>
              <span className="px-4 py-1.5 bg-white border border-[#a9b4b9]/30 text-[#566166] rounded-full text-xs font-medium hover:border-[#6ffbbe]/50 cursor-pointer whitespace-nowrap">{profile.registered_category}</span>
              <span className="px-4 py-1.5 bg-white border border-[#a9b4b9]/30 text-[#566166] rounded-full text-xs font-medium hover:border-[#6ffbbe]/50 cursor-pointer whitespace-nowrap">Financial Support</span>
            </div>
          </header>

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {results.map((scheme, idx) => (
                <div key={idx} className="group relative bg-[#ffffff] rounded-xl p-8 shadow-[0px_4px_20px_rgba(42,52,57,0.06)] hover:shadow-[0px_8px_30px_rgba(42,52,57,0.1)] transition-all duration-300 flex flex-col">
                  
                  {scheme.keywordScore > 0 && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-[#eef9cd] text-[#565f3e] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> High Intent Match
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#d5e3fd] flex items-center justify-center text-[#455367] flex-shrink-0">
                      <Activity className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2 pr-20">
                        <span className="px-2 py-0.5 bg-[#d5e3fd] text-[#455367] text-[10px] font-bold rounded">FINANCIAL SUPPORT</span>
                        <span className="px-2 py-0.5 bg-[#f0f4f7] border border-[#d9e4ea] text-[#566166] text-[10px] font-bold rounded uppercase">{scheme.scheme_type || 'Funding'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#2a3439] pr-3 leading-tight">{scheme.scheme_name}</h3>
                      <div className="flex items-center gap-1 text-[#a9b4b9] text-xs mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.location.state || 'Pan-India'}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#566166] leading-relaxed mb-6 block min-h-[4rem]">
                     {scheme.benefits && scheme.benefits.length > 180 ? scheme.benefits.substring(0, 180) + '...' : scheme.benefits}
                     <a href={scheme.source_url || '#'} target="_blank" rel="noreferrer" className="text-[#006c49] font-bold hover:underline ml-1 inline-flex items-center">
                       View Full Details <ArrowRight className="w-3 h-3 ml-0.5" />
                     </a>
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8 pt-4 border-t border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-[#a9b4b9] uppercase tracking-widest mb-3">Key Benefits</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-[#2a3439] leading-snug">
                          <CheckCircle2 className="text-[#006c49] w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{scheme.benefits ? scheme.benefits.split('.')[0] : 'Accelerate Growth'}</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-[#2a3439] leading-snug">
                          <CheckCircle2 className="text-[#006c49] w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Provides business expansion capital</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#a9b4b9] uppercase tracking-widest mb-3">Eligibility</h4>
                      <p className="text-sm text-[#2a3439] leading-snug">{scheme.eligibility_summary ? scheme.eligibility_summary.split('.')[0] : 'Valid Business Registration.'}</p>
                    </div>
                  </div>

                  <div className="mb-8 mt-auto">
                    <h4 className="text-xs font-bold text-[#a9b4b9] uppercase tracking-widest mb-4">Application Steps</h4>
                    <div className="flex items-center w-full">
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#006c49] text-[#e1ffec] flex items-center justify-center text-xs font-bold ring-4 ring-[#006c49]/20">1</div>
                        <span className="text-[10px] mt-2 font-bold text-[#2a3439]">Analyze</span>
                      </div>
                      <div className="h-[2px] flex-1 bg-[#6ffbbe]"></div>
                      <div className="flex flex-col items-center flex-1 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-[#d9e4ea] text-[#566166] flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-[10px] mt-2 font-bold text-[#566166]">Submit</span>
                      </div>
                      <div className="h-[2px] flex-1 bg-[#f0f4f7]"></div>
                      <div className="flex flex-col items-center flex-1 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-[#d9e4ea] text-[#566166] flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-[10px] mt-2 font-bold text-[#566166]">Track</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleAutoFill(idx); }}
                      className="flex-[2] bg-gradient-to-br from-[#006c49] to-[#004930] text-[#e1ffec] py-3 rounded-xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#004930]"
                    >
                      <Activity className="w-5 h-5" />
                      Fill through AI Agent
                    </button>
                    <a 
                      href={scheme.source_url || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 bg-[#f0f4f7] text-[#455367] font-bold text-sm rounded-xl hover:bg-[#d9e4ea] transition-colors border border-[#d9e4ea] flex items-center justify-center text-center"
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
"""

new_content = content[:start_idx] + new_ui + content[end_idx:]

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("success")
