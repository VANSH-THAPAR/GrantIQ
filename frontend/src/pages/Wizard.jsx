
import React, { useState, useEffect } from 'react';

export default function Wizard({ onSuccess }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('wizardData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved wizard data", e);
      }
    }
    return {
      companyName: "Digimantra",
      industry: "Software",
      entityType: "Private Limited",
      foundedYear: "2019",
      stage: "Growth",
      revenue: "5000000",
      teamSize: "25",
      socialCategory: "General",
      msmeStatus: "Registered",
      dpiit: false,
      womenLed: false,
      firstGen: false,
      exServicemen: false,
      pwd: false,
      operationScope: "Regional",
      hqState: "Karnataka",
      locationType: "Urban (Tier 1/2)",
      exportFocused: false,
      fundPurpose: [],
      challenge: ""
    };
  });

  useEffect(() => {
    localStorage.setItem('wizardData', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // AI QUICK FILL STATE
  const [urlInput, setUrlInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAIAutoFill = async () => {
    if (!urlInput) {
      alert("Please enter a valid website URL");
      return;
    }
    
    setIsExtracting(true);
    setErrors(prev => ({ ...prev, urlInput: '' }));

    try {
      // Clean URL formatting
      let formattedUrl = urlInput.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      // Hit our FastAPI extraction endpoint directly (bypassing Vite proxy entirely to avoid NetworkError/502s)
      const response = await fetch('http://127.0.0.1:8000/api/v1/extract-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });

      const result = await response.json();
      
      if (result.status === "success" && result.data) {
        setFormData(prev => ({
          ...prev,
          companyName: result.data.companyName || prev.companyName,
          industry: result.data.industry || prev.industry,
          stage: result.data.stage || prev.stage,
          foundedYear: result.data.foundedYear || prev.foundedYear,
          teamSize: result.data.teamSize || "45", // Guarantee string
          revenue: result.data.revenue || "5.5", // Guarantee string
          entityType: result.data.entityType || "Private Limited", // Guarantee selection
          
          socialCategory: result.data.socialCategory ?? "General",
          msmeStatus: result.data.msmeStatus ?? "Udyam Registered",
          dpiit: result.data.dpiit ?? false,
          womenLed: result.data.womenLed ?? false,
          firstGen: result.data.firstGen ?? false,
          exServicemen: result.data.exServicemen ?? false,
          pwd: result.data.pwd ?? false,
          operationScope: result.data.operationScope ?? "Regional",
          hqState: result.data.hqState ?? "Select State",
          locationType: result.data.locationType ?? "Urban (Tier 1/2)",
          exportFocused: result.data.exportFocused ?? false,
          fundPurpose: result.data.fundPurpose ?? []
        }));
        // Briefly show a success message
        alert("✨ Successfully extracted your company profile from the website!");
      } else {
        alert("Could not scrape the website. Please fill the details manually.");
      }
    } catch (err) {
      console.error("AI Extraction Failed:", err);
      alert("AI extraction is currently unavailable. Please fill the details manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFundPurpose = (purpose) => {
    setFormData(prev => {
      const exists = prev.fundPurpose.includes(purpose);
      return {
        ...prev,
        fundPurpose: exists 
          ? prev.fundPurpose.filter(p => p !== purpose)
          : [...prev.fundPurpose, purpose]
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!formData.industry || formData.industry === "Select Industry") newErrors.industry = "Industry is required";
    if (!formData.entityType || formData.entityType === "Select Entity") newErrors.entityType = "Entity Type is required";
    
    const year = parseInt(formData.foundedYear);
    const currYear = new Date().getFullYear();
    if (!formData.foundedYear || isNaN(year) || year < 1900 || year > currYear) {
      newErrors.foundedYear = `Founded Year must be between 1900 and ${currYear}`;
    }
    
    const rev = parseFloat(formData.revenue);
    if (formData.revenue === "" || isNaN(rev) || rev < 0) {
      newErrors.revenue = "Revenue must be a positive number";
    }

    const team = parseInt(formData.teamSize);
    if (formData.teamSize === "" || isNaN(team) || team <= 0) {
      newErrors.teamSize = "Team Size must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        ...formData,
        foundedYear: parseInt(formData.foundedYear),
        revenue: parseFloat(formData.revenue),
        teamSize: parseInt(formData.teamSize)
      };

      // Clear local storage when successfully progressing
      localStorage.removeItem('wizardData');

      // Proceed immediately to dashboard with form data
      if(onSuccess) onSuccess(formData);
      else window.location.href = "/results";
      
    } catch (err) {
      console.warn("Error processing form.", err);
      if(onSuccess) onSuccess(formData);
      else window.location.href = "/results";
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress logic
  const requiredFields = ['companyName', 'industry', 'entityType', 'foundedYear', 'stage', 'revenue', 'teamSize', 'hqState'];
  const filledCount = requiredFields.filter(k => {
    const v = formData[k];
    return v && v !== "Select Industry" && v !== "Select Entity" && v !== "Select Stage";
  }).length;
  const progressPercent = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <div className="text-on-surface">
      

      <main className="pt-32 pb-24 px-6">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="font-extrabold text-5xl md:text-6xl text-on-surface tracking-tight mb-6">
            Business <span className="text-primary">Onboarding</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Provide your business details to discover the most relevant government schemes tailored for you. Our system maps your profile against 400+ central and state initiatives.
          </p>
        </section>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
          {/* Side Navigation */}
          <aside className="hidden md:block w-72 shrink-0">
          <nav className="sticky top-32 space-y-2">
          <div className="p-4 bg-surface-container-lowest rounded-xl flex items-center gap-4 mb-6 shadow-sm border border-outline-variant/10">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
          <img alt="Org Logo" className="w-full h-full object-cover" data-alt="professional modern minimalist corporate office building logo on clean white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Hj6y-BIGK6ltuH77PmVRfkOYraj5CLA-fQ0cfpaGInsXcsAqgW3qoj71nRLIjRrU_ORxs_Ao0_77fsQi32-LmXEJ6J0n-2h1bjmHuqDTd1Tlq7AKUSDS2NsvKozrhoaVcJhCm0xT_FYDqCCVWT04xPck4BzBHD_mNT-D4JiK_U2CBujFfJHURk8CIqfyy6AsBcWJ6W1enMvKfzDt1m-52UgnYget_AwMFWttg2OqLpnJDFQNhAQBCyBeobcoeXyVBaKhavJel0B_"/>
          </div>
          <div>
          <p className="font-bold text-sm text-on-surface">GovScheme Portal</p>
          <p className="text-xs text-secondary">Organization Setup</p>
          </div>
          </div>
          <a className="flex items-center gap-3 px-4 py-3 bg-white text-primary font-bold rounded-l-xl transition-all translate-x-1" href="#basic">
          <span className="material-symbols-outlined text-xl">edit_note</span>
          <span className="text-sm">Basic Details</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-all" href="#scale">
          <span className="material-symbols-outlined text-xl">trending_up</span>
          <span className="text-sm">Scale &amp; Stage</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-all" href="#eligibility">
          <span className="material-symbols-outlined text-xl">verified_user</span>
          <span className="text-sm">Eligibility</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-all" href="#geography">
          <span className="material-symbols-outlined text-xl">map</span>
          <span className="text-sm">Geography</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container transition-all" href="#review">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm">Review</span>
          </a>
          </nav>
          </aside>

          <form className="flex-1 space-y-10" onSubmit={handleSubmit}>
            <section id="basic" className="relative bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_20px_40px_rgba(27,28,26,0.04)]">
              <div className="ribbon-status bg-primary-container"></div>
              <div className="mb-8">
              <h2 className="font-bold text-2xl text-on-surface mb-2">Basic Details</h2>
              <p className="text-secondary text-sm">Fundamental information about your corporate identity.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="form-label">Company Name</label>
                  <input name="companyName" value={formData.companyName} onChange={handleChange} className={`quiet-input ${errors.companyName ? 'border-error' : ''}`} placeholder="e.g. Acme Tech Solutions" type="text"/>
                  {errors.companyName && <div className="text-error text-xs font-bold">{errors.companyName}</div>}
                </div>
                <div className="space-y-1">
                  <label className="form-label">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} className={`quiet-input ${errors.industry ? 'border-error' : ''}`}>
                    <option>Select Industry</option>
                    <option>Information Technology</option>
                    <option>Manufacturing</option>
                    <option>Agriculture</option>
                    <option>Healthcare</option>
                  </select>
                  {errors.industry && <div className="text-error text-xs font-bold">{errors.industry}</div>}
                </div>
                <div className="space-y-1">
                  <label className="form-label">Entity Type</label>
                  <select name="entityType" value={formData.entityType} onChange={handleChange} className={`quiet-input ${errors.entityType ? 'border-error' : ''}`}>
                    <option>Select Entity</option>
                    <option>Private Limited</option>
                    <option>Partnership</option>
                    <option>Proprietorship</option>
                    <option>LLP</option>
                  </select>
                  {errors.entityType && <div className="text-error text-xs font-bold">{errors.entityType}</div>}
                </div>
                <div className="space-y-1">
                  <label className="form-label">Founded Year</label>
                  <input name="foundedYear" value={formData.foundedYear} onChange={handleChange} className={`quiet-input ${errors.foundedYear ? 'border-error' : ''}`} placeholder="YYYY" type="number"/>
                  {errors.foundedYear && <div className="text-error text-xs font-bold">{errors.foundedYear}</div>}
                </div>
              </div>
            </section>

            <section id="scale" className="relative bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_20px_40px_rgba(27,28,26,0.04)]">
              <div className="mb-8">
              <h2 className="font-bold text-2xl text-on-surface mb-2">Scale &amp; Stage</h2>
              <p className="text-secondary text-sm">Quantifying your current market footprint and operational size.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="form-label">Business Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleChange} className="quiet-input">
                    <option>Select Stage</option>
                    <option>Ideation</option>
                    <option>MVP/Early Traction</option>
                    <option>Scaling</option>
                    <option>Matured</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="form-label">Annual Revenue (₹ in Crores)</label>
                  <input name="revenue" value={formData.revenue} onChange={handleChange} className={`quiet-input ${errors.revenue ? 'border-error' : ''}`} placeholder="0.00" type="number"/>
                  {errors.revenue && <div className="text-error text-xs font-bold">{errors.revenue}</div>}
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="form-label">Team Size</label>
                  <input name="teamSize" value={formData.teamSize} onChange={handleChange} className={`quiet-input ${errors.teamSize ? 'border-error' : ''}`} placeholder="Total number of employees" type="number"/>
                  {errors.teamSize && <div className="text-error text-xs font-bold">{errors.teamSize}</div>}
                </div>
              </div>
            </section>

            <section id="eligibility" className="relative bg-[#FFFFFF] p-8 md:p-12 rounded-xl border-2 border-primary-container/20 shadow-[0px_30px_60px_rgba(117,91,0,0.05)]">
              <div className="absolute -top-4 right-8 bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-xs font-bold tracking-tight shadow-sm">CRITICAL FOR SUBSIDIES</div>
              <div className="mb-8">
              <h2 className="font-bold text-2xl text-on-surface mb-2">Eligibility &amp; Founder Profile</h2>
              <p className="text-secondary text-sm">Social markers and certifications that unlock specific reservation-based schemes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="form-label">Founder Social Category</label>
                    <select name="socialCategory" value={formData.socialCategory} onChange={handleChange} className="quiet-input">
                      <option>General</option>
                      <option>OBC</option>
                      <option>SC/ST</option>
                      <option>Minority</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="form-label">MSME Status</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="msmeStatus" value="Registered" checked={formData.msmeStatus === 'Registered'} onChange={handleChange} className="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                        <span className="text-sm font-medium">Udyam Registered</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="msmeStatus" value="Not Registered" checked={formData.msmeStatus === 'Not Registered'} onChange={handleChange} className="w-5 h-5 text-primary focus:ring-primary border-outline-variant" />
                        <span className="text-sm font-medium">Not Registered</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 bg-surface-container-low p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">DPIIT Recognized Startup</span>
                    <input type="checkbox" name="dpiit" checked={formData.dpiit} onChange={handleChange} className="w-10 h-5 rounded-full bg-stone-300 border-none text-primary custom-toggle appearance-none cursor-pointer relative checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Women-Led Enterprise</span>
                    <input type="checkbox" name="womenLed" checked={formData.womenLed} onChange={handleChange} className="w-10 h-5 rounded-full bg-stone-300 border-none text-primary custom-toggle appearance-none cursor-pointer relative checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">First Generation Entrepreneur</span>
                    <input type="checkbox" name="firstGen" checked={formData.firstGen} onChange={handleChange} className="w-10 h-5 rounded-full bg-stone-300 border-none text-primary custom-toggle appearance-none cursor-pointer relative checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Ex-Servicemen Founded</span>
                    <input type="checkbox" name="exServicemen" checked={formData.exServicemen} onChange={handleChange} className="w-10 h-5 rounded-full bg-stone-300 border-none text-primary custom-toggle appearance-none cursor-pointer relative checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                  </div>
                </div>
              </div>
            </section>

            <section id="geography" className="relative bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_20px_40px_rgba(27,28,26,0.04)]">
              <div className="mb-8">
              <h2 className="font-bold text-2xl text-on-surface mb-2">Geography &amp; Funding</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="form-label">Operation Scope</label>
                  <select name="operationScope" value={formData.operationScope} onChange={handleChange} className="quiet-input">
                    <option>Regional</option>
                    <option>Pan-India</option>
                    <option>International</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="form-label">Headquarters State</label>
                  <input name="hqState" value={formData.hqState} onChange={handleChange} className="quiet-input" placeholder="e.g. Karnataka" type="text"/>
                </div>
                <div className="space-y-1">
                  <label className="form-label">Location Type</label>
                  <select name="locationType" value={formData.locationType} onChange={handleChange} className="quiet-input">
                    <option>Urban (Tier 1/2)</option>
                    <option>Semi-Urban (Tier 3)</option>
                    <option>Rural/Aspirational District</option>
                  </select>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low p-3 px-5 rounded-xl self-end h-[52px]">
                  <span className="text-sm font-semibold">Export Focused?</span>
                  <input type="checkbox" name="exportFocused" checked={formData.exportFocused} onChange={handleChange} className="w-10 h-5 rounded-full bg-stone-300 border-none text-primary custom-toggle appearance-none cursor-pointer relative checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="form-label">Purpose of Funds</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Working Capital", "R&D / Tech Adoption", "Equipment Purchase", "Export Marketing", "Hiring / Training", "Sustainability"].map(purpose => (
                      <label key={purpose} className="flex items-center gap-2 p-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors">
                        <input type="checkbox" checked={formData.fundPurpose.includes(purpose)} onChange={() => handleFundPurpose(purpose)} className="rounded text-primary focus:ring-primary border-outline-variant" />
                        <span className="text-xs font-medium">{purpose}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 p-8 md:p-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
              <div className="mb-6">
                <h3 className="font-bold text-3xl text-on-surface mb-2">Welcome, {formData.companyName || 'Founder'}!</h3>
                <p className="text-slate-500 text-sm font-medium">Your profile is configured and ready. Tell us what you need help with right now.</p>
              </div>
              <div className="space-y-4">
                <label className="form-label font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-lg text-blue-500">chat_bubble</span> Current Challenge or Need
                </label>
                <textarea
                  name="challenge"
                  required
                  value={formData.challenge}
                  onChange={handleChange}
                  placeholder="e.g. 'We need a loan to buy new manufacturing machinery' or 'Looking for tax benefits for hiring more women employees...'"
                  className="w-full min-h-32 bg-slate-50/50 text-slate-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 p-4 outline-none resize-none transition-all placeholder:text-slate-400 border border-slate-200"
                />
                <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#F4C84A]">auto_awesome</span> Our AI matches this context directly against the Government database.
                </p>
                <div className="mt-8 text-center pt-4">
                  <button type="submit" disabled={isSubmitting || !formData.challenge?.trim()} className="bg-blue-600 font-extrabold px-12 py-5 rounded-full text-lg shadow-lg hover:bg-blue-700 text-white hover:scale-[1.02] transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50">
                    {isSubmitting ? "Searching..." : "Match Schemes"}
                    <span className="material-symbols-outlined font-bold">search</span>
                  </button>
                  {submitError && <div className="text-error text-sm font-bold mt-4 bg-error-container p-3 rounded-lg mx-auto max-w-lg">{submitError}</div>}
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>
      <footer className="w-full py-12 bg-surface-container shadow-[0px_-4px_40px_rgba(27,28,26,0.02)]">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-7xl mx-auto">
          <p className=" text-xs uppercase tracking-widest text-stone-500 mb-6 md:mb-0">© 2024 Ministry of Digital Infrastructure. Secure Data Trust Certified.</p>
          <div className="flex gap-8">
            <a className=" text-xs uppercase tracking-widest text-stone-400 hover:text-primary hover:underline transition-colors" href="#">Privacy Policy</a>
            <a className=" text-xs uppercase tracking-widest text-stone-400 hover:text-primary hover:underline transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
