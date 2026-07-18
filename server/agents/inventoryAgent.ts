import { GoogleGenAI } from '@google/genai';

export class InventoryAgent {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key' });
  }

  async analyze() {
    if (!process.env.GEMINI_API_KEY) {
      return { severity: 'critical', message: 'Stockout tomorrow', recommendation: 'Expedite order' };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: 'Analyze inventory data for a tech retailer. Give one critical low stock alert.',
      });
      return {
        severity: 'critical',
        message: response.text,
        recommendation: 'Reorder immediately'
      };
    } catch (e) {
      console.error(e);
      return { severity: 'critical', message: 'Analysis failed', recommendation: 'Manual check required' };
    }
  }
}
