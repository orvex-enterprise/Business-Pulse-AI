const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

content = content.replace(
  `queryClient.invalidateQueries({ queryKey: ['dashboard'] });`,
  `queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });`
);

fs.writeFileSync('src/pages/Settings.tsx', content);
