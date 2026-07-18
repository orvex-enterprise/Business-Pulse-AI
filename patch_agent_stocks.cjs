const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

const targetStocksSchema = `        config: {
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
              }
            }
          }
        }`;

const newStocksSchema = `        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              correlation: { type: Type.STRING },
              stocks: {
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
                  }
                }
              }
            }
          }
        }`;

const targetMockStocks = `  private mockStocks(industry: string) {
    return [
      { 
        directiveTitle: \`Secure Secondary \${industry} Suppliers\`, 
        supplyChainGuidance: 'Macro news indicates upcoming shipping delays in Southeast Asian regions; consider locking down extra inventory now.', 
        marketMovements: 'Major logistics firms are reporting a 15% increase in freight costs.', 
        action: 'Immediate Action', 
        confidence: '85%', 
        risk: 'Medium' 
      },
      { 
        directiveTitle: \`Capitalize on \${industry} Competitor Weakness\`, 
        supplyChainGuidance: 'Monitor alternative component availability as Tier 1 suppliers face shortages.', 
        marketMovements: 'Leading competitor recently missed earnings due to supply chain bottlenecks.', 
        action: 'Monitor', 
        confidence: '60%', 
        risk: 'High' 
      }
    ];
  }`;

const newMockStocks = `  private mockStocks(industry: string) {
    return {
      sentiment: "Bullish",
      correlation: "0.84",
      stocks: [
        { 
          directiveTitle: \`Secure Secondary \${industry} Suppliers\`, 
          supplyChainGuidance: 'Macro news indicates upcoming shipping delays in Southeast Asian regions; consider locking down extra inventory now.', 
          marketMovements: 'Major logistics firms are reporting a 15% increase in freight costs.', 
          action: 'Immediate Action', 
          confidence: '85%', 
          risk: 'Medium' 
        },
        { 
          directiveTitle: \`Capitalize on \${industry} Competitor Weakness\`, 
          supplyChainGuidance: 'Monitor alternative component availability as Tier 1 suppliers face shortages.', 
          marketMovements: 'Leading competitor recently missed earnings due to supply chain bottlenecks.', 
          action: 'Monitor', 
          confidence: '60%', 
          risk: 'High' 
        }
      ]
    };
  }`;

content = content.replace(targetStocksSchema, newStocksSchema).replace(targetMockStocks, newMockStocks);

// Also need to wrap the response in aiAgent.ts generateStocks
// Wait, generateStocks already returns the raw parsed JSON, so it will return {sentiment, correlation, stocks} naturally if the schema demands it.
// Wait, currently server/routes/stocks.ts wraps it? Let's check stocks.ts

fs.writeFileSync('server/agents/aiAgent.ts', content);
