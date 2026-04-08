const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Update renderWizard
code = code.replace(
  'return <Wizard onSuccess={() => setView(\'dashboard\')} />;',
  `return <Wizard onSuccess={(data) => {
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
        
        // Auto trigger search by setting a flag or using an effect
        setTimeout(() => {
            const form = document.getElementById("search-form");
            if(form) form.requestSubmit();
        }, 100);
      }
      setView('dashboard');
    }} />;`
);

// We need to give the form an ID
code = code.replace(
  '<form onSubmit={handleSearch} className="p-6">',
  '<form id="search-form" onSubmit={handleSearch} className="p-6">'
);

fs.writeFileSync('src/App.jsx', code);
