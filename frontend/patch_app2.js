const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Hide the search form visually from Dashboard
code = code.replace(
  '<div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-10 overflow-hidden relative">',
  '<div className="hidden bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-10 overflow-hidden relative">'
);

// We need handleSearch to not fail if e is undefined
code = code.replace(
  'e.preventDefault();',
  'if(e) e.preventDefault();'
);

// We can just use useEffect to auto-trigger handleSearch when dashboard opens
code = code.replace(
  '// 3. Dashboard View',
  `
  React.useEffect(() => {
    if (view === 'dashboard' && problemText && results.length === 0 && !isSearching) {
      handleSearch();
    }
  }, [view, problemText]);

  // 3. Dashboard View`
);

fs.writeFileSync('src/App.jsx', code);
