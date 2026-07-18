const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

code = code.replace(
  /const data = await res\.json\(\)\s*if \(!res\.ok\) \{\s*throw new Error\(data\.error \|\| 'Authentication failed'\)\s*\}/g,
  `let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(\`Server returned \${res.status} \${res.statusText}: \${text.slice(0, 100)}\`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }`
);

fs.writeFileSync('src/pages/Login.tsx', code);
