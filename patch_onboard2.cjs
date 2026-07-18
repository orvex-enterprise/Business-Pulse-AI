const fs = require('fs');
let content = fs.readFileSync('src/pages/Onboarding.tsx', 'utf-8');

content = content.replace(/industry: store\.industry \|\| 'Tech Retail'/g, 'industry: store.industry');

fs.writeFileSync('src/pages/Onboarding.tsx', content);
