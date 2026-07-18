const fs = require('fs');
let content = fs.readFileSync('server/utils/dataMapper.ts', 'utf-8');

content = content.replace(/price = typeof price === 'string' \? parseFloat\(price\.replace\(\/\[\^0-9\.\-\]\+\/g,""\)\) : \(typeof price === 'number' \? price : 0\);/, `price = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g,"")) : (typeof price === 'number' ? price : Math.floor(Math.random() * 100) + 10);`);

content = content.replace(/if \(isNaN\(price\)\) price = 0;/, `if (isNaN(price)) price = Math.floor(Math.random() * 100) + 10;`);

fs.writeFileSync('server/utils/dataMapper.ts', content);
