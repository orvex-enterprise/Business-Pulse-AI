const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let patched = false;
  
  // A simple regex to replace generic fetch JSON parsing with safe parsing.
  // We'll replace instances of:
  // const data = await res.json();
  // if (!res.ok) { ... }
  // with a safe parse block.
  
  content = content.replace(/const (\w+) = await res\.json\(\)/g, (match, varName) => {
    patched = true;
    return `let ${varName};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        ${varName} = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? 'Unexpected response format' : 'API Error: ' + res.status);
      }`;
  });
  
  if (patched) {
    fs.writeFileSync(filePath, content);
    console.log('Patched', filePath);
  }
}

['src/pages/Onboarding.tsx', 'src/pages/Dashboard.tsx', 'src/pages/Inventory.tsx', 'src/pages/Trends.tsx', 'src/pages/Settings.tsx'].forEach(patchFile);
