import { workspaceSettings } from '../routes/settings.js';
import { mockRecords } from '../routes/mockRecords.js';
import { sendTelegramAlert } from '../services/telegram.js';

export class Scheduler {
  private jobs: NodeJS.Timeout[] = [];
  
  // Track last run time for each workspace so we don't spam
  private lastRunTracker: Record<string, number> = {};

  start() {
    console.log('[Scheduler] Starting background jobs...');
    
    // Check every 10 seconds for real-time, or check intervals
    this.jobs.push(
      setInterval(() => {
        this.runInventoryChecks();
      }, 10 * 1000)
    );
  }

  private async runInventoryChecks() {
    const now = Date.now();

    for (const [workspaceId, settings] of Object.entries(workspaceSettings)) {
      const { aiFrequency, phoneNumber } = settings;
      if (!phoneNumber || !aiFrequency) continue;

      let intervalMs = 0;
      if (aiFrequency === 'realtime') intervalMs = 60 * 1000; // Check every minute in real-time
      if (aiFrequency === 'hourly') intervalMs = 60 * 60 * 1000;
      if (aiFrequency === 'daily') intervalMs = 24 * 60 * 60 * 1000;
      if (aiFrequency === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
      
      const lastRun = this.lastRunTracker[workspaceId] || 0;
      if (now - lastRun >= intervalMs || !this.lastRunTracker[workspaceId]) {
        this.lastRunTracker[workspaceId] = now;
        
        // Run logic for this workspace
        await this.checkWorkspaceInventory(workspaceId, phoneNumber);
      }
    }
  }

  private async checkWorkspaceInventory(workspaceId: string, phoneNumber: string) {
    const records = mockRecords.filter(r => r.workspaceId === workspaceId);
    if (records.length === 0) return;

    const totalStock = records.reduce((sum, item) => sum + item.quantity, 0);
    const avgStock = records.length > 0 ? totalStock / records.length : 0;
    const lowStockThreshold = Math.max(20, avgStock * 0.2);

    const lowItems = records.filter(item => item.quantity < lowStockThreshold);
    if (lowItems.length > 0) {
      // Create alert string for the first few items
      const itemsList = lowItems.slice(0, 3).map(i => `${i.product} (${i.quantity} units)`).join(', ');
      const message = `🚨 <b>Business Pulse Inventory Alert</b> 🚨\n\nLow Stock detected: ${itemsList}${lowItems.length > 3 ? ` and ${lowItems.length - 3} others.` : '.'}\nPlease review your dashboard for actionable AI recommendations.`;
      
      try {
        await sendTelegramAlert(phoneNumber, message);
      } catch(e) {
        console.error("Alert failed", e);
      }
    }
  }

  stop() {
    this.jobs.forEach(clearInterval);
    console.log('[Scheduler] Stopped all jobs.');
  }
}
