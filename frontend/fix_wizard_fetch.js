const fs = require('fs');
let code = fs.readFileSync('src/pages/Wizard.jsx', 'utf8');

const oldFetchBlock = `      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        if(onSuccess) onSuccess(formData);
        else window.location.href = "/results";
      } else {
        console.warn("Backend unavailable, proceeding to dashboard for demo purposes.");
        if(onSuccess) onSuccess(formData);
        else window.location.href = "/results";
      }`;

const newFetchBlock = `      // Bypass the missing /api/onboarding endpoint
      if(onSuccess) onSuccess(formData);
      else window.location.href = "/results";`;

code = code.replace(oldFetchBlock, newFetchBlock);

fs.writeFileSync('src/pages/Wizard.jsx', code);
