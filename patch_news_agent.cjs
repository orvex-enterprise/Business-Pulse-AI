const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');

const generateNewsInventoryMethod = `
  async generateNewsDrivenInventory(industry: string, news: any[], currentRecords: any[]) {
    if (!process.env.GEMINI_API_KEY) {
      return this.mockNewsDrivenInventory();
    }
    
    const newsContext = news && news.length > 0 ? \`\\n    Recent Headlines:\\n\` + news.map((n: any) => \`    - \${n.title} (\${n.contentSnippet || ''})\`).join('\\n') : 'No recent news found.';
    
    // Pass current inventory to let Gemini know what we actually stock, or let it invent if no records exist.
    const inventoryContext = currentRecords.slice(0, 10).map((r: any) => \`- \${r.product} (Qty: \${r.quantity})\`).join('\\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: \`Analyze these current news headlines for the \${industry} industry. Generate actionable, structured inventory suggestions (e.g., 'Reorder due to supply chain surge' or 'Discount due to low demand') and a predictive market sentiment statement.

Current Top Inventory Items:
\${inventoryContext || 'None'}

\${newsContext}

Return data strictly in JSON formatting matching this schema:
{
  "marketSentiment": "...",
  "recommendations": [
    {
      "id": "...",
      "item_title": "...",
      "quantity_on_hand": 0,
      "status": "...",
      "prediction": "...",
      "action": "..."
    }
  ]
}
\`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketSentiment: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    item_title: { type: Type.STRING },
                    quantity_on_hand: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    prediction: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ['id', 'item_title', 'quantity_on_hand', 'status', 'prediction', 'action']
                }
              }
            },
            required: ['marketSentiment', 'recommendations']
          }
        }
      });
      return JSON.parse(response.text() || '{}');
    } catch (e) {
      console.error('Failed to generate news-driven inventory', e);
      return this.mockNewsDrivenInventory();
    }
  }

  private mockNewsDrivenInventory() {
    return {
      marketSentiment: "Mixed sentiment. Monitor supply chains closely due to recent geopolitical events.",
      recommendations: [
        {
          id: "SKU-NWS-1",
          item_title: "Trending Tech Widget",
          quantity_on_hand: 120,
          status: "Low Stock",
          prediction: "Demand surge",
          action: "Reorder due to supply chain surge"
        }
      ]
    };
  }
`;

// Insert it before the last closing brace
content = content.replace(/}\s*$/, generateNewsInventoryMethod + '\n}');

fs.writeFileSync('server/agents/aiAgent.ts', content);
