const fs = require('fs');
let code = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

const generateStocksOld = /async generateStocks\(industry: string, metrics\?: any\) \{[\s\S]*?return this\.mockStocks\(\);\s*\}\s*\}/;

const generateStocksNew = `async generateStocks(industry: string, metrics?: any, news?: any[]) {
    const metricsContext = metrics ? \`
    Current Business Live Metrics:
    - Total Products Cataloged: \${metrics.totalProducts}
    - Top 3 Selling Products by Volume: \${metrics.topProductsList?.join(', ') || 'N/A'}
    - Current Total Inventory: \${metrics.totalInventory} units
    - Total Revenue to Date: $\${metrics.totalRevenue}
    \` : '';
    
    const newsContext = news && news.length > 0 ? \`\\n    Recent Market/Macro Headlines:\\n\` + news.map((n: any) => \`    - \${n.title} (\${n.contentSnippet || ''})\`).join('\\n') : '';

    if (!process.env.GEMINI_API_KEY) {
      return this.mockStocks();
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: \`Generate 3 distinct, actionable, forward-looking strategic directives based on the local database metrics and real macro-economic news for the \${industry} industry.
       CRITICAL INSTRUCTIONS:
      - The strategies MUST include explicit Supply Chain Guidance based on macro news.
      - The strategies MUST include Public Market Movements (highlight relevant industry market shifts or public companies making moves).
      - Include explicit Risk and Confidence scoring.
      
      \${metricsContext}
      \${newsContext}\`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                directiveTitle: { type: Type.STRING },
                supplyChainGuidance: { type: Type.STRING },
                marketMovements: { type: Type.STRING },
                action: { type: Type.STRING },
                confidence: { type: Type.STRING },
                risk: { type: Type.STRING }
              },
              required: ['directiveTitle', 'supplyChainGuidance', 'marketMovements', 'action', 'confidence', 'risk']
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch(e: any) {
      console.warn(\`[AI Agent] API Rate Limit hit, using fallback.\`);
      console.log(\`[AI Agent] Falling back to mock stocks data.\`);
      return this.mockStocks();
    }
  }`;

code = code.replace(generateStocksOld, generateStocksNew);

code = code.replace(/private mockStocks\(\) \{[\s\S]*?\];\s*\}/, `private mockStocks() {
    return [
      { 
        directiveTitle: 'Secure Secondary Suppliers', 
        supplyChainGuidance: 'Macro news indicates upcoming shipping delays in Southeast Asian regions; consider locking down extra inventory now.', 
        marketMovements: 'Major logistics firms are reporting a 15% increase in freight costs.', 
        action: 'Immediate Action', 
        confidence: '85%', 
        risk: 'Medium' 
      },
      { 
        directiveTitle: 'Capitalize on Competitor Weakness', 
        supplyChainGuidance: 'Monitor alternative component availability as Tier 1 suppliers face shortages.', 
        marketMovements: 'Leading competitor recently missed earnings due to supply chain bottlenecks.', 
        action: 'Monitor', 
        confidence: '92%', 
        risk: 'Low' 
      }
    ];
  }`);

fs.writeFileSync('server/agents/aiAgent.ts', code);
