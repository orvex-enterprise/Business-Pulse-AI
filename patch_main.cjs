const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf-8');

if (!content.includes('/// <reference types="vite/client" />')) {
  content = '/// <reference types="vite/client" />\n' + content;
  fs.writeFileSync('src/main.tsx', content);
}
