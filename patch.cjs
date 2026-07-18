const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

content = content.replace(
  /const data = await res\.json\(\)\s*if \(\!res\.ok\) \{\s*throw new Error\(data\.error \|\| 'Authentication failed'\)\s*\}/,
  `let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? 'Unexpected response format' : 'API Error: ' + res.status);
      }
      
      if (!res.ok) {
        throw new Error(data?.error || 'Authentication failed')
      }`
);

fs.writeFileSync('src/pages/Login.tsx', content);
