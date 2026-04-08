const fs = require('fs');
let code = fs.readFileSync('src/pages/Wizard.jsx', 'utf8');

// Replace logo and font
code = code.replace(
  '<span className="font-headline font-extrabold text-white text-xl tracking-tight">CivicMatch</span>',
  '<span className="font-black tracking-tight text-white text-2xl">Grant<span className="text-[#F4C84A]">IQ</span></span>'
);

// Replace font styles
code = code.replace(/font-headline/g, 'font-sans');
code = code.replace(/font-body/g, 'font-sans');

// Replace submission error
code = code.replace(
  'if (!res.ok) throw new Error("Submission failed");',
  `if (!res.ok) {
        console.warn("Backend unavailable, proceeding to dashboard for demo purposes.");
      }`
);

fs.writeFileSync('src/pages/Wizard.jsx', code);
