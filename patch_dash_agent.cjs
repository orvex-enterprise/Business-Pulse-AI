const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

// Update generateDashboard signature
content = content.replace(/async generateDashboard\(industry: string, dataConnections: string\[\], metrics\?: any\)/, 'async generateDashboard(industry: string, dataConnections: string[], metrics?: any, news?: any[])');

// Update contents prompt
const targetContents = `contents: \`Generate a dashboard overview for a company in the \${industry} industry. They have the following data connections: \${dataConnections.join(', ') || 'None'}. Provide 7 days of inventory trends and 4 weeks of alert frequency. Provide 3 AI recommendations and 3 recent alerts. \${metricsContext}\`,`;
const replacementContents = `contents: \`Generate a dashboard overview for a company in the \${industry} industry. They have the following data connections: \${dataConnections.join(', ') || 'None'}. Provide 7 days of inventory trends and 4 weeks of alert frequency. Provide 3 AI recommendations based on the news, and 3 recent alerts. Also provide a marketSentiment summary based on these news headlines: \${news ? news.map((n: any) => n.title).join(', ') : 'None'}. \${metricsContext}\`,`;
content = content.replace(targetContents, replacementContents);

// Update responseSchema to include marketSentiment
const targetProps = `properties: {
              inventoryData: {`;
const replacementProps = `properties: {
              marketSentiment: { type: Type.STRING },
              inventoryData: {`;
content = content.replace(targetProps, replacementProps);

fs.writeFileSync('server/agents/aiAgent.ts', content);
