const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const target = `      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }`;

const replacement = `      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? 'Unexpected response format' : 'API Error: ' + res.status);
      }
      
      if (!res.ok) {
        throw new Error(data?.error || 'Authentication failed')
      }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Login.tsx', content);
