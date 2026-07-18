const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const target = `      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decoded.email, name: decoded.name, picture: decoded.picture })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google Authentication failed')`;

const replacement = `      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decoded.email, name: decoded.name, picture: decoded.picture })
      })
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? 'Unexpected response format' : 'Server Error: ' + res.status);
      }
      
      if (!res.ok) throw new Error(data?.error || 'Google Authentication failed')`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Login.tsx', content);
