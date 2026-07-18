const fs = require('fs');
let content = fs.readFileSync('server/utils/dataMapper.ts', 'utf-8');

content = content.replace(/quantity = typeof quantity === 'string' \? parseInt\(quantity\.replace\(\/\[\^0-9\.\-\]\+\/g,""\), 10\) : \(typeof quantity === 'number' \? quantity : 0\);/, `quantity = typeof quantity === 'string' ? parseInt(quantity.replace(/[^0-9.-]+/g,""), 10) : (typeof quantity === 'number' ? quantity : 1);`);

content = content.replace(/if \(isNaN\(quantity\)\) quantity = 0;/, `if (isNaN(quantity)) quantity = 1;`);

fs.writeFileSync('server/utils/dataMapper.ts', content);
