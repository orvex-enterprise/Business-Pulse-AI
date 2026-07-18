const fs = require('fs');
let code = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

if (!code.includes('import { fetchIndustryNews }')) {
  code = code.replace(/import \{ GoogleGenAI, Type, Schema \} from '@google\/genai';/, 
    "import { GoogleGenAI, Type, Schema } from '@google/genai';\nimport { fetchIndustryNews } from '../services/newsService.js';");
}

const generateTrendsOld = /async generateTrends\(industry: string, metrics\?: any\) \{[\s\S]*?return JSON\.parse\(response\.text \|\| '\[\]'\);\s*\} catch\(e: any\) \{\s*console\.warn\(`\[AI Agent\] API Rate Limit hit, using fallback.`\);\s*console\.log\(`\[AI Agent\] Falling back to mock trends data.`\);\s*return this\.mockTrends\(\);\s*\}\s*\}/;

const generateTrendsNew = `async generateTrends(industry: string, metrics?: any) {
    const metricsContext = metrics ? \`
    Current Business Live Metrics:
    - Total Products Cataloged: \${metrics.totalProducts}
    - Top 3 Selling Products by Volume: \${metrics.topProductsList?.join(', ') || 'N/A'}
    - Current Total Inventory: \${metrics.totalInventory} units
    - Total Revenue to Date: $\${metrics.totalRevenue}
    \` : '';
    
    let newsContext = '';
    try {
      const news = await fetchIndustryNews(industry);
      if (news.length > 0) {
        newsContext = '\\n    Recent Market Headlines:\\n' + news.map(n => \`    - \${n.title}\`).join('\\n');
      }
    } catch(e) {}

    if (!process.env.GEMINI_API_KEY) {
      return this.mockTrends();
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: \`Generate 4 highly specific market trends for a business in the EXACT industry: \${industry}.
       CRITICAL INSTRUCTIONS: 
       - Combine external market trends with this specific industry.
       - Synthesize the recent headlines to project future market directions. For example: "Based on your high sales volume of X and recent market headlines showing Y, we project Z."
       - NEVER recommend unrelated trends.
       - Include realistic growth percentages and confidence scores. 
       
       \${metricsContext}
       \${newsContext}\`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                growth: { type: Type.STRING },
                confidence: { type: Type.STRING },
                action: { type: Type.STRING },
                category: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ['name', 'growth', 'confidence', 'action', 'category', 'analysis']
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch(e: any) {
        console.warn(\`[AI Agent] API Rate Limit hit, using fallback.\`);
        console.log(\`[AI Agent] Falling back to mock trends data.\`);
        return this.mockTrends();
    }
  }`;

code = code.replace(generateTrendsOld, generateTrendsNew);
fs.writeFileSync('server/agents/aiAgent.ts', code);
