import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Award,
  Map,
  ArrowUpRight,
  TrendingDown,
  Activity,
  Lightbulb,
  Cpu,
  Globe,
  MessageSquareText,
  Send,
  X,
  Bot
} from 'lucide-react';
import Papa from 'papaparse';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, ComposedChart, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#8B5CF6'];

export default function DashboardAnalytics({ navigate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([{ role: 'bot', text: 'Hello! I am your AI Grant Advisor. Ask me anything about your current business state or recommended MSME and startup schemes.' }]);
  const [inputMsg, setInputMsg] = useState('');

  const sendChat = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userQ = inputMsg.trim();
    setChatMsgs(prev => [...prev, { role: 'user', text: userQ }]);
    setInputMsg('');
    
    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ })
      });
      const data = await res.json();
      setChatMsgs(prev => [...prev, { role: 'bot', text: data.answer || "I'm sorry, I could not process that request." }]);
    } catch(err) {
      setChatMsgs(prev => [...prev, { role: 'bot', text: "Error connecting to AI engine. Ensure your backend is running on port 8000." }]);
    }
  };

  useEffect(() => {
    // Fetch and parse the CSV
    fetch('/company_analytics.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validData = results.data.filter(item => item && item.Date && typeof item.Sales_Revenue === 'number');
            const formatted = validData.map(item => ({
              ...item,
              // Format date nicely for axes
              ShortDate: new Date(item.Date).toLocaleDateString('en-US', { month: 'short' }),
              TotalRevenue: (item.Sales_Revenue || 0) + (item.Export_Revenue || 0)
            }));
            setData(formatted);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Error fetching CSV:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Aggregated metrics
  const totalSales = data.reduce((acc, curr) => acc + (curr.Sales_Revenue || 0), 0);
  const totalExport = data.reduce((acc, curr) => acc + (curr.Export_Revenue || 0), 0);
  const avgSatisfaction = data.length > 0 ? (data.reduce((acc, curr) => acc + (curr.Cst_Sat_Score || 0), 0) / data.length).toFixed(1) : 0;
  const latestEmployees = data.length > 0 ? (data[data.length - 1]?.Employees || 0) : 0;
  
  // Calculate Growth (last month vs previous month approx)
  const lastMonthSales = data.slice(-2).reduce((a, b) => a + (b.Sales_Revenue || 0), 0);
  const prevMonthSales = data.slice(-4, -2).reduce((a, b) => a + (b.Sales_Revenue || 0), 0);
  
  let growth = "0.0";
  if (prevMonthSales > 0) {
    growth = (((lastMonthSales - prevMonthSales) / prevMonthSales) * 100).toFixed(1);
  }

  // Regional split for pie chart
  const regionData = data.reduce((acc, curr) => {
    if (!curr.Region || !curr.Sales_Revenue) return acc;
    const existing = acc.find(item => item.name === curr.Region);
    if (existing) {
      existing.value += curr.Sales_Revenue;
    } else {
      acc.push({ name: curr.Region, value: curr.Sales_Revenue });
    }
    return acc;
  }, []);

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              Company Analytics Hub
            </h1>
            <p className="text-slate-500 font-medium mt-1">Real-time performance tracking & scheme insights</p>
          </div>
          <button 
            onClick={() => navigate('/schemes')}
            className="self-start md:self-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
          >
            Back to Schemes
          </button>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Total Domestic Sales" 
            value={`$${(totalSales / 1000).toFixed(1)}k`} 
            trend={growth} 
            icon={<DollarSign className="w-5 h-5 text-blue-500" />} 
          />
          <KPICard 
            title="Export Revenue" 
            value={`$${(totalExport / 1000).toFixed(1)}k`} 
            trend="12.5" 
            icon={<Globe className="w-5 h-5 text-emerald-500" />} 
          />
          <KPICard 
            title="Avg Satisfaction" 
            value={`${avgSatisfaction} / 10`} 
            trend="2.1" 
            icon={<Award className="w-5 h-5 text-amber-500" />} 
          />
          <KPICard 
            title="Active Workforce" 
            value={latestEmployees} 
            trend="8.5" 
            icon={<Users className="w-5 h-5 text-indigo-500" />} 
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Revenue Growth Trajectory</h3>
              <p className="text-sm text-slate-400">Domestic vs Export comparison (YTD)</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="ShortDate" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Sales_Revenue" name="Domestic Sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="Export_Revenue" name="Export Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorExport)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-slate-800">Regional Distribution</h3>
              <p className="text-sm text-slate-400">Sales spread across territories</p>
            </div>
            <div className="flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* R&D vs Marketing Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                Investment Breakdown
              </h3>
              <p className="text-sm text-slate-400">R&D and Marketing Spends over time</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ShortDate" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="R_and_D_Spend" name="R&D Spend" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Marketing_Spend" name="Marketing Spend" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Smart Insights & Scheme Suggestions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
              <Lightbulb className="w-6 h-6 text-emerald-400" />
              Strategic Business Insights
            </h3>
            
            <div className="space-y-4 relative z-10">
              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: 0.1}} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex gap-4">
                <div className="mt-1">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-100 flex items-center gap-2">
                    Actionable Insight 
                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">High Priority</span>
                  </h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Your R&D spend has consistently grown by over 15% in Q3/Q4. You are highly eligible for the <strong className="text-white">MSME Technology Upgrade Scheme</strong> or <strong className="text-white">Gujarat State R&D Subsidy</strong> to recoup up to 25% of these costs.
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: 0.2}} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex gap-4">
                <div className="mt-1">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-100">Export Expansion Detected</h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    Export revenue is showing a massive upward trajectory (+{growth}%). We strongly recommend applying for the <strong className="text-white">Market Access Initiative (MAI)</strong> focusing on reimbursement for international marketing and travel.
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: 0.3}} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex gap-4">
                <div className="mt-1">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-100">Workforce Tier Update</h4>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    You've recently crossed the 150 employee mark. Update your compliance status and check out the <strong className="text-white">EPFO Employer Incentive Scheme</strong> to subsidize recent hires.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Auto trigger agent action */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/schemes')}
              className="mt-6 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 relative z-10"
            >
              Analyze Schemes & Grants <ArrowUpRight className="w-5 h-5" />
            </motion.button>
          </div>

        </div>
      </div>

      {/* Floating AI Chatbot strictly limited to Dashboard View */}
      <AnimatePresence>
        {isChatOpen ? (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-[100] max-h-[600px] h-[75vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide">GrantIQ AI Analyst</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-100/80">Business & Scheme Context</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors border border-transparent hover:border-white/30"
              >
                <X className="w-5 h-5 text-emerald-50" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative selection:bg-emerald-500/30">
              <div className="flex justify-center my-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Session Started</span>
              </div>
              {chatMsgs.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 max-w-[85%] relative ${m.role === 'user' ? 'bg-slate-800 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm border border-slate-900/10 shadow-sm' : 'bg-white text-slate-700 rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-slate-200 shadow-sm'}`}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                    <div className={`absolute bottom-[-16px] text-[9px] font-bold uppercase tracking-wider text-slate-400 ${m.role === 'user' ? 'right-1' : 'left-1'}`}>{m.role === 'user' ? 'You' : 'AI'}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={sendChat} className="p-3 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <div className="relative">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ask about schemes or context..." 
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="w-full text-sm py-3 px-4 pr-12 bg-slate-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white border text-slate-800 font-medium placeholder:text-slate-400 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-all font-bold shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-[9px] font-bold text-center text-slate-400 mt-2 uppercase tracking-widest mx-auto flex items-center justify-center gap-1"><Lightbulb className="w-3 h-3 text-amber-500" /> Responses strictly bound to context.txt</p>
            </form>
          </motion.div>
        ) : (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 p-4 bg-slate-900 border-2 border-emerald-500 rounded-full text-white shadow-2xl shadow-emerald-500/20 z-[100] group flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur group-hover:opacity-60 transition opacity-0"></div>
            <MessageSquareText className="w-6 h-6 relative z-10" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

// Mini Component
function KPICard({ title, value, trend, icon }) {
  const isPositive = parseFloat(trend) >= 0;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(parseFloat(trend))}%
        </div>
      </div>
      <div>
        <h4 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-1">{title}</h4>
        <div className="text-3xl font-black text-slate-800">{value}</div>
      </div>
    </motion.div>
  );
}
