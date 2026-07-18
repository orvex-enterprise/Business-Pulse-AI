const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

const targetSchema = `          responseSchema: {
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
          }`;

const replacementSchema = `          responseSchema: {
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
                  },
                  required: ['name', 'growth', 'confidence', 'action', 'category', 'analysis']
                }
              }
            },
            required: ['summary', 'topOpportunityTitle', 'topOpportunityDesc', 'topOpportunityLift', 'categories']
          }`;

content = content.replace(targetSchema, replacementSchema);

content = content.replace(/JSON\.parse\(response\.text \|\| '\[\]'\)/g, "JSON.parse(response.text() || '{}')");

fs.writeFileSync('server/agents/aiAgent.ts', content);
