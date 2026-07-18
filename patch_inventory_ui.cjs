const fs = require('fs');
let content = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

content = content.replace(/const \{ data: inventoryItems, isLoading, isError, error \} = useQuery/, `const { data: inventoryData, isLoading, isError, error } = useQuery`);

content = content.replace(/if \(isLoading \|\| !inventoryItems\)/, `if (isLoading || !inventoryData)`);

content = content.replace(/\{inventoryItems\.map/, `{inventoryData?.recommendations?.map`);

content = content.replace(/<CardTitle>Product Recommendations<\/CardTitle>/, `<CardTitle>Product Recommendations</CardTitle>
          {inventoryData?.marketSentiment && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm border border-blue-100 dark:border-blue-800/50">
              <span className="font-semibold">AI Market Sentiment:</span> {inventoryData.marketSentiment}
            </div>
          )}`);

fs.writeFileSync('src/pages/Inventory.tsx', content);
