const fs = require('fs');
let code = fs.readFileSync('src/pages/Stocks.tsx', 'utf-8');
code = code.replace(/\{recommendations\.map/g, '{pageData.stocks.map');
fs.writeFileSync('src/pages/Stocks.tsx', code);
