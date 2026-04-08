const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Remove font definitions from theme
code = code.replace(/--font-headline:.*?;/g, '');
code = code.replace(/--font-body:.*?;/g, '');
code = code.replace(/--font-label:.*?;/g, '');

// Remove fonts from apply
code = code.replace(/ font-body;/g, ';');
code = code.replace(/ font-label;/g, ';');
code = code.replace(/ font-headline;/g, ';');

fs.writeFileSync('src/index.css', code);
