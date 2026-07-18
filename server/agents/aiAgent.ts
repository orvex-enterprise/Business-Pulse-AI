import { fetchIndustryNews } from '../services/newsService';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key' });

export class AIAgent {
  async generateDashboard(industry: string, dataConnections: string[], metrics?: any, news?: any[]) {
    if (!process.env.GEMINI_API_KEY) {
      return this.mockDashboard(industry, metrics);
    }
    
    const metricsContext = metrics ? `
    Current Business Live Metrics:
    - Total Revenue to Date: $${metrics.totalRevenue}
    - Current Total Inventory: ${metrics.totalInventory} units
    - Total Orders: ${metrics.totalOrders}
    - Unique Customers: ${metrics.uniqueCustomers}
    ` : '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate a dashboard overview for a company in the ${industry} industry. They have the following data connections: ${dataConnections.join(', ') || 'None'}. Provide 7 days of inventory trends and 4 weeks of alert frequency. Provide 3 AI recommendations based on the news, and 3 recent alerts. Also provide a marketSentiment summary based on these news headlines: ${news ? news.map((n: any) => n.title).join(', ') : 'None'}. ${metricsContext}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketSentiment: { type: Type.STRING },
              inventoryData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  }
                }
              },
              alertData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    alerts: { type: Type.NUMBER }
                  }
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING }
                  }
                }
              },
              recentAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    time: { type: Type.STRING },
                    type: { type: Type.STRING } // critical, success, info
                  }
                }
              },
              stats: {
                type: Type.OBJECT,
                properties: {
                  inventory: { type: Type.NUMBER },
                  revenue: { type: Type.NUMBER },
                  orders: { type: Type.NUMBER },
                  customers: { type: Type.NUMBER },
                  recommendations: { type: Type.NUMBER }
                }
              }
            },
            required: ['inventoryData', 'alertData', 'recommendations', 'recentAlerts', 'stats']
          }
        }
      });
      return this.parseJSON(response.text, '{}');
    } catch (e: any) {
      console.warn(`[AI Agent] API Rate Limit hit, using fallback.`);
      console.log(`[AI Agent] Falling back to mock dashboard data.`);
      return this.mockDashboard(industry);
    }
  }

  async generateInventory(industry: string, metrics?: any) {
    const metricsContext = metrics ? `
    Current Business Live Metrics:
    - Total Products Cataloged: ${metrics.totalProducts}
    - Top 3 Selling Products by Volume: ${metrics.topProductsList?.join(', ') || 'N/A'}
    - Current Total Inventory: ${metrics.totalInventory} units
    - Total Revenue to Date: $${metrics.totalRevenue}
    ` : '';
    if (!process.env.GEMINI_API_KEY) {
      return this.mockInventory();
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate 5 realistic inventory items for a company in the ${industry} industry. Include realistic stock quantities and statuses. ${metricsContext}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                sku: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                status: { type: Type.STRING },
                prediction: { type: Type.STRING },
                action: { type: Type.STRING }
              },
              required: ['id', 'name', 'sku', 'qty', 'status', 'prediction', 'action']
            }
          }
        }
      });
      return this.parseJSON(response.text, '[]');
    } catch (e: any) {
      console.warn(`[AI Agent] API Rate Limit hit, using fallback.`);
      console.log(`[AI Agent] Falling back to mock inventory data.`);
      return this.mockInventory();
    }
  }

  async generateTrends(industry: string, metrics?: any) {
    const metricsContext = metrics ? `
    Current Business Live Metrics:
    - Total Products Cataloged: ${metrics.totalProducts}
    - Top 3 Selling Products by Volume: ${metrics.topProductsList?.join(', ') || 'N/A'}
    - Current Total Inventory: ${metrics.totalInventory} units
    - Total Revenue to Date: ${metrics.totalRevenue}
    ` : '';
    
    let newsContext = '';
    try {
      const news = await fetchIndustryNews(industry);
      if (news.length > 0) {
        newsContext = '\n    Recent Market Headlines:\n' + news.map(n => `    - ${n.title}`).join('\n');
      }
    } catch(e) {}

    if (!process.env.GEMINI_API_KEY) {
      return this.mockTrends(industry);
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate 4 highly specific market trends for a business in the EXACT industry: ${industry}.
       CRITICAL INSTRUCTIONS: 
       - Combine external market trends with this specific industry.
       - Synthesize the recent headlines to project future market directions. For example: "Based on your high sales volume of X and recent market headlines showing Y, we project Z."
       - NEVER recommend unrelated trends.
       - Include realistic growth percentages and confidence scores. 
       
       ${metricsContext}
       ${newsContext}`,
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
      return this.parseJSON(response.text, '[]');
    } catch(e: any) {
        console.warn(`[AI Agent] API Rate Limit hit, using fallback.`);
        console.log(`[AI Agent] Falling back to mock trends data.`);
        return this.mockTrends(industry);
    }
  }

  async generateStocks(industry: string, metrics?: any, news?: any[]) {
    const metricsContext = metrics ? `
    Current Business Live Metrics:
    - Total Products Cataloged: ${metrics.totalProducts}
    - Top 3 Selling Products by Volume: ${metrics.topProductsList?.join(', ') || 'N/A'}
    - Current Total Inventory: ${metrics.totalInventory} units
    - Total Revenue to Date: ${metrics.totalRevenue}
    ` : '';
    
    const newsContext = news && news.length > 0 ? `\n    Recent Market/Macro Headlines:\n` + news.map((n: any) => `    - ${n.title} (${n.contentSnippet || ''})`).join('\n') : '';

    if (!process.env.GEMINI_API_KEY) {
      return this.mockStocks(industry);
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate 3 distinct, actionable, forward-looking strategic directives based on the local database metrics and real macro-economic news for the ${industry} industry.
       CRITICAL INSTRUCTIONS:
      - The strategies MUST include explicit Supply Chain Guidance based on macro news.
      - The strategies MUST include Public Market Movements (highlight relevant industry market shifts or public companies making moves).
      - Include explicit Risk and Confidence scoring.
      
      ${metricsContext}
      ${newsContext}`,
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
      return this.parseJSON(response.text, '[]');
    } catch(e: any) {
      console.warn(`[AI Agent] API Rate Limit hit, using fallback.`);
            return this.mockStocks(industry);
    }
  }

  private mockDashboard(industry: string, metrics?: any) {
    return {
      inventoryData: [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 550 },
        { name: 'Thu', value: 450 },
        { name: 'Fri', value: 600 },
        { name: 'Sat', value: 700 },
        { name: 'Sun', value: 650 },
      ],
      alertData: [
        { name: 'Week 1', alerts: 12 },
        { name: 'Week 2', alerts: 19 },
        { name: 'Week 3', alerts: 8 },
        { name: 'Week 4', alerts: 15 },
      ],
      recommendations: [
        { title: `Restock key ${industry} items`, desc: 'Predicted stockout in 3 days based on current velocity.' },
        { title: 'Lower price on seasonal items', desc: 'Season ending soon, optimize clearance.' },
        { title: 'Investigate Supplier A', desc: 'Average delivery delay increased by 2 days.' },
      ],
      recentAlerts: [
        { title: 'Stock Critical', time: '10 mins ago', type: 'critical' },
        { title: 'Sync Completed', time: '1 hour ago', type: 'success' },
        { title: 'New Market Trend Detected', time: '3 hours ago', type: 'info' },
      ],
      stats: {
        inventory: 1420,
        revenue: 45000,
        orders: 132,
        customers: 84,
        recommendations: 12
      }
    };
  }

  private mockInventory() {
    return [
      { id: '1', name: 'Product A', sku: 'SKU-A', qty: 12, status: 'Low Stock', prediction: 'Stockout in 4 days', action: 'Reorder' },
      { id: '2', name: 'Product B', sku: 'SKU-B', qty: 850, status: 'Overstocked', prediction: '90 days supply', action: 'Discount' },
    ];
  }

  private mockTrends(industry: string) {
     return {
       summary: `Based on analyzing market data points for ${industry}, we are seeing a strong resurgence in sustainable options. We recommend reallocating marketing spend toward these emerging opportunities.`,
       topOpportunityTitle: 'Bundle Top Items',
       topOpportunityDesc: 'Historical data suggests bundling these trending items increases AOV by 32%. Launch before end of month.',
       topOpportunityLift: 'Expected Lift: $45k MRR',
       categories: [
         { name: `Emerging ${industry} Innovations`, growth: '+45%', confidence: 'High (92%)', action: 'Increase Stock', category: 'Core', analysis: `Based on recent headlines in the ${industry} space, this sector is growing rapidly.` }
       ]
     };
  }

  private mockStocks(industry: string) {
    return [
      { 
        directiveTitle: `Secure Secondary ${industry} Suppliers`, 
        supplyChainGuidance: 'Macro news indicates upcoming shipping delays in Southeast Asian regions; consider locking down extra inventory now.', 
        marketMovements: 'Major logistics firms are reporting a 15% increase in freight costs.', 
        action: 'Immediate Action', 
        confidence: '85%', 
        risk: 'Medium' 
      },
      { 
        directiveTitle: `Capitalize on ${industry} Competitor Weakness`, 
        supplyChainGuidance: 'Monitor alternative component availability as Tier 1 suppliers face shortages.', 
        marketMovements: 'Leading competitor recently missed earnings due to supply chain bottlenecks.', 
        action: 'Monitor', 
        confidence: '92%', 
        risk: 'Low' 
      }
    ];
  }

  async generateNewsDrivenInventory(industry: string, news: any[], currentRecords: any[]) {
    if (!process.env.GEMINI_API_KEY) {
      return this.mockNewsDrivenInventory();
    }
    
    const newsContext = news && news.length > 0 ? `\n    Recent Headlines:\n` + news.map((n: any) => `    - ${n.title} (${n.contentSnippet || ''})`).join('\n') : 'No recent news found.';
    
    // Pass current inventory to let Gemini know what we actually stock, or let it invent if no records exist.
    const inventoryContext = currentRecords.slice(0, 10).map((r: any) => `- ${r.product} (Qty: ${r.quantity})`).join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze these current news headlines for the ${industry} industry. Generate actionable, structured inventory suggestions (e.g., 'Reorder due to supply chain surge' or 'Discount due to low demand') and a predictive market sentiment statement.

Current Top Inventory Items:
${inventoryContext || 'None'}

${newsContext}

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
`,
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
      return this.parseJSON(response.text, '{}');
    } catch (e) {
      console.error('Failed to generate news-driven inventory', e);
      return this.mockNewsDrivenInventory();
    }
  }

  
  private parseJSON(text: string | null | undefined, fallback: string) {
    if (!text) return JSON.parse(fallback);
    try {
      return JSON.parse(text);
    } catch (e) {
      // Try stripping markdown code blocks
      const match = text.match(/\x60\x60\x60(?:json)?\s*([\s\S]*?)\s*\x60\x60\x60/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (e2) {}
      }
      return JSON.parse(fallback);
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

}