const fs = require('fs');
let code = fs.readFileSync('src/pages/Wizard.jsx', 'utf8');

const newSection = `
            <section className="mt-12 p-8 md:p-12 bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(27,28,26,0.04)] border-2 border-primary/20">
              <div className="mb-6">
                <h3 className="font-sans font-bold text-3xl text-on-surface mb-2">Welcome! Your profile is configured.</h3>
                <p className="text-secondary text-sm">Tell us what you need help with right now to match with the most relevant schemes.</p>
              </div>
              <div className="space-y-4">
                <label className="form-label font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span> Current Challenge or Need
                </label>
                <textarea
                  name="challenge"
                  required
                  value={formData.challenge}
                  onChange={handleChange}
                  placeholder="e.g. 'We need a loan to buy new manufacturing machinery' or 'Looking for tax benefits for hiring more women employees...'"
                  className="w-full min-h-32 bg-surface-container text-on-surface rounded-xl focus:ring-2 focus:ring-primary focus:border-primary p-4 outline-none resize-none transition-all placeholder:text-stone-400 border border-outline-variant/30"
                />
                <p className="text-xs text-stone-500 font-medium flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-sm text-[#F4C84A]">auto_awesome</span> Our AI matches this context directly against the Government database.
                </p>
                <div className="mt-8 text-center">
                  <button type="submit" disabled={isSubmitting || !formData.challenge.trim()} className="bg-[#F4C84A] text-[#241a00] font-sans font-black px-12 py-5 rounded-full text-lg shadow-lg hover:bg-white hover:scale-[1.02] transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50">
                    {isSubmitting ? "Searching..." : "Match Schemes"}
                    <span className="material-symbols-outlined font-bold">search</span>
                  </button>
                  {submitError && <div className="text-error text-sm font-bold mt-4 bg-error-container p-3 rounded-lg mx-auto max-w-lg">{submitError}</div>}
                </div>
              </div>
            </section>
`;

code = code.replace(
  /<section className="mt-12 text-center p-12 bg-\[#2F2F2F\].*?<\/section>/s,
  newSection.trim()
);

fs.writeFileSync('src/pages/Wizard.jsx', code);
