const fs = require('fs');
let content = fs.readFileSync('src/pages/Trends.tsx', 'utf-8');

content = content.replace(/\{selectedIndustry\}/g, '{selectedIndustry || "your business sector"}');

fs.writeFileSync('src/pages/Trends.tsx', content);
