const fs = require('fs');
const content = fs.readFileSync('server/routes/connections.ts', 'utf-8');
const target = `      } else if (type === 'rest' || type === 'REST API') {
        if (typeof credentials === 'string') {
          if (!credentials.trim()) return reject(new Error('Missing REST API URL'));
        } else if (!credentials.url) {
          return reject(new Error('Missing REST API URL'));
        }
      }
      resolve(true);`;
const replacement = `      } else if (type === 'rest' || type === 'REST API') {
        if (typeof credentials === 'string') {
          if (!credentials.trim()) return reject(new Error('Missing REST API URL'));
        } else if (!credentials.url) {
          return reject(new Error('Missing REST API URL'));
        }
      } else if (type === 'Supabase') {
        if (typeof credentials === 'object' && (!credentials.url || !credentials.key)) {
          return reject(new Error(\`Missing URL or API Key for Supabase\`));
        }
        if (credentials.url) {
          let checkUrl = credentials.url.endsWith('/') ? credentials.url.slice(0, -1) : credentials.url;
          fetch(\`\${checkUrl}/rest/v1/\`, {
             headers: {
               'apikey': credentials.key,
               'Authorization': \`Bearer \${credentials.key}\`
             }
          }).then(async (res) => {
             if (!res.ok && res.status !== 404 && res.status !== 400) { 
               if (res.status === 401 || res.status === 403) {
                 const text = await res.text();
                 reject(new Error(\`Supabase connection failed: \${res.status} \${text}\`));
               } else {
                 resolve(true);
               }
             } else {
               resolve(true);
             }
          }).catch(err => {
             reject(new Error(\`Supabase connection error: \${err.message}\`));
          });
          return;
        }
      }
      resolve(true);`;
fs.writeFileSync('server/routes/connections.ts', content.replace(target, replacement));
