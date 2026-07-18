const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

const targetTrendsSchema = `        config: {
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
              }
            }
          }
        }`;

const newTrendsSchema = `        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              topOpportunityTitle: { type: Type.STRING },
              topOpportunityDesc: { type: Type.STRING },
              topOpportunityLift: { type: Type.STRING },
              categories: {
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
                  }
                }
              }
            }
          }
        }`;

const targetMockTrends = `  private mockTrends(industry: string) {
     return [
      { name: \`Emerging \${industry} Innovations\`, growth: '+45%', confidence: 'High (92%)', action: 'Increase Stock', category: 'Core', analysis: \`Based on recent headlines in the \${industry} space, this sector is growing rapidly.\` },
    ];
  }`;

const newMockTrends = `  private mockTrends(industry: string) {
     return {
       summary: \`Based on analyzing market data points for \${industry}, we are seeing a strong resurgence in sustainable options. We recommend reallocating marketing spend toward these emerging opportunities.\`,
       topOpportunityTitle: 'Bundle Top Items',
       topOpportunityDesc: 'Historical data suggests bundling these trending items increases AOV by 32%. Launch before end of month.',
       topOpportunityLift: 'Expected Lift: $45k MRR',
       categories: [
         { name: \`Emerging \${industry} Innovations\`, growth: '+45%', confidence: 'High (92%)', action: 'Increase Stock', category: 'Core', analysis: \`Based on recent headlines in the \${industry} space, this sector is growing rapidly.\` }
       ]
     };
  }`;

content = content.replace(targetTrendsSchema, newTrendsSchema).replace(targetMockTrends, newMockTrends);
fs.writeFileSync('server/agents/aiAgent.ts', content);
