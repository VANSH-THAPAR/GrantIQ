const fs=require('fs'); 
let b = fs.readFileSync('backend/services/playwrightService.js', 'utf8'); 
b = b.replace(/catch\(e3\)\s*\{\s*console\.log\("Failed to select fuzzy match", e3\);\s*\}\s*\}\s*\}/, \catch(e3){console.log("Failed to select fuzzy match", e3);}}} try{ await (new Promise(r => setTimeout(r, 3000))); }catch(e){}\); 
fs.writeFileSync('backend/services/playwrightService.js', b);
