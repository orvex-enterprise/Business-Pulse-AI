const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/import \{ Stocks \} from '@\/pages\/Stocks'/, '');
content = content.replace(/<Route path="\/stocks" element=\{<Stocks \/>\} \/>/, '');
fs.writeFileSync('src/App.tsx', content);

let layout = fs.readFileSync('src/components/layout/DashboardLayout.tsx', 'utf-8');
layout = layout.replace(/\{ name: 'Stocks', href: '\/stocks', icon: LineChart \},/, '');
layout = layout.replace(/LineChart,\s*/, '');
fs.writeFileSync('src/components/layout/DashboardLayout.tsx', layout);

let serverApp = fs.readFileSync('server/app.ts', 'utf-8');
serverApp = serverApp.replace(/import stocksRoutes from '\.\/routes\/stocks\.js';/, '');
serverApp = serverApp.replace(/app\.use\('\/api\/stocks', stocksRoutes\);/, '');
fs.writeFileSync('server/app.ts', serverApp);
