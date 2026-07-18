const fs = require('fs');
let content = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');

content = content.replace(/let totalOrders = records\.length;/, `let totalOrders = records.length;\n      let uniqueCustomers = records.length;`);

content = content.replace(/totalOrders\n\s*\}\);/, `totalOrders,\n        customers: uniqueCustomers\n      });`);

fs.writeFileSync('server/routes/dashboard.ts', content);
