const fs = require('fs');
let content = fs.readFileSync('server/utils/metrics.ts', 'utf-8');

content = content.replace(/try {\s*const schema = JSON\.parse\(file\.schemaDetected \|\| '\{\}'\);\s*if \(schema\.type === 'Orders'\) {[\s\S]*?} catch\(e\) \{\}/, `
    totalOrders += file.recordCount || 0;
    if (file.totalRevenue) totalRevenue += file.totalRevenue;
    uniqueCustomers += file.recordCount || 0;
    if (file.totalInventory) totalInventory += file.totalInventory;
`);

fs.writeFileSync('server/utils/metrics.ts', content);
