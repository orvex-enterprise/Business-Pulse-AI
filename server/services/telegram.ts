import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'mock_telegram_bot_token';

/**
 * Sends a message via Telegram to a specific phone number.
 * Note: The Telegram Bot API does not natively support sending messages directly by phone number 
 * unless the bot already has the user's chat_id. In a real-world scenario, you would use a 
 * Telegram client library (like gramjs or tdlib) to resolve phone numbers to chat IDs or 
 * have the user message the bot first to link their account. 
 * 
 * For the purpose of this implementation, we will mock the resolution and use the standard Bot API 
 * to send the message (or simulate it if no real token/chatId is available).
 */
export async function sendTelegramAlert(phoneNumber: string, message: string) {
  try {
    console.log(`[Telegram Service] Resolving phone number ${phoneNumber} to chat ID...`);
    
    // MOCK: resolve phone number to chat ID
    const chatId = resolvePhoneNumberToChatId(phoneNumber);

    console.log(`[Telegram Service] Sending message to chat ID ${chatId}...`);
    
    if (TELEGRAM_BOT_TOKEN === 'mock_telegram_bot_token') {
      console.log(`[Telegram Service] (MOCK) Sent message to ${phoneNumber}: ${message}`);
      return { success: true, mocked: true };
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Telegram Service] Failed to send message:', errorData);
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[Telegram Service] Error sending alert:', error);
    throw error;
  }
}

function resolvePhoneNumberToChatId(phoneNumber: string): string {
  // In a real application, you'd look this up in your database 
  // where users have previously authenticated/linked their Telegram account.
  // We'll just return a mock chat ID based on the phone number.
  return `chat_${phoneNumber.replace(/\D/g, '')}`;
}
