/**
 * Samarqand CrafTour - Telegram Bot Utility Helpers
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Sends a raw API request to Telegram
 */
async function callTelegramApi(method, payload) {
  if (!BOT_TOKEN) {
    console.warn(`[Telegram API] Skipping call to ${method}: TELEGRAM_BOT_TOKEN is not defined.`);
    return null;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error(`[Telegram API Error] Method: ${method}, Payload:`, payload, 'Response:', data);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error(`[Telegram API Error] Method: ${method} request failed:`, error);
    return null;
  }
}

/**
 * Sends a message to a specific Telegram chat
 * @param {string|number} chatId - Telegram chat identifier
 * @param {string} text - Message markdown text
 * @param {object} [replyMarkup] - Optional Telegram ReplyMarkup
 */
export async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  return callTelegramApi('sendMessage', payload);
}

/**
 * Edits the reply markup (buttons) of an existing message
 */
export async function editTelegramMessageReplyMarkup(chatId, messageId, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup || { inline_keyboard: [] },
  };

  return callTelegramApi('editMessageReplyMarkup', payload);
}

/**
 * Edits the text of an existing message
 */
export async function editTelegramMessageText(chatId, messageId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  return callTelegramApi('editMessageText', payload);
}

/**
 * Sends notification messages to the selected Guide and Driver for a newly paid/confirmed booking
 */
export async function notifyPartnersForBooking(booking) {
  const { id, booking_date, tourist_name, passenger_count, customer_language, guide, vehicle, booking_items } = booking;
  
  // 1. Sort locations by visit_order and format path
  const sortedItems = [...(booking_items || [])].sort((a, b) => a.visit_order - b.visit_order);
  const locationNames = sortedItems.map(item => {
    const loc = item.location;
    if (!loc) return '';
    const name = customer_language === 'RU' 
      ? loc.name_ru 
      : customer_language === 'UZ' 
        ? (loc.name_uz || loc.name_en) 
        : loc.name_en;
    
    if (item.visit_order > 100) {
      const day = Math.floor(item.visit_order / 100);
      const order = item.visit_order % 100;
      return customer_language === 'UZ' 
        ? `[${day}-kun, ${order}] ${name}` 
        : customer_language === 'RU' 
          ? `[День ${day}, ${order}] ${name}` 
          : `[Day ${day}, ${order}] ${name}`;
    }
    return name;
  }).filter(Boolean).join(' ➔ ');

  // 2. Format travel date
  const formattedDate = new Date(booking_date).toLocaleDateString(
    customer_language === 'UZ' ? 'uz-UZ' : customer_language === 'RU' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  // 3. Send message to Guide if bot is active
  if (guide && guide.telegram_chat_id && guide.bot_active) {
    const text = `🔔 <b>YANGI BUYURTMA! (Gid uchun)</b>\n\n` +
      `📅 <b>Sana:</b> ${formattedDate}\n` +
      `🗺 <b>Marshrut:</b> ${locationNames || 'Shaxsiy marshrut'}\n` +
      `👥 <b>Turistlar soni:</b> ${passenger_count} kishi\n` +
      `👤 <b>Buyurtmachi:</b> ${tourist_name}\n\n` +
      `*Ushbu buyurtmani tasdiqlaysizmi?*`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: `confirm_booking:${id}:guide` },
          { text: '❌ Rad etish', callback_data: `reject_booking:${id}:guide` }
        ]
      ]
    };

    await sendTelegramMessage(guide.telegram_chat_id, text, replyMarkup);
    console.log(`Telegram notification sent to Guide: ${guide.full_name} (chat_id: ${guide.telegram_chat_id})`);
  }

  // 4. Send message to Driver if bot is active
  if (vehicle && vehicle.telegram_chat_id && vehicle.bot_active) {
    const text = `🔔 <b>YANGI BUYURTMA! (Haydovchi uchun)</b>\n\n` +
      `📅 <b>Sana:</b> ${formattedDate}\n` +
      `🗺 <b>Marshrut:</b> ${locationNames || 'Shaxsiy marshrut'}\n` +
      `👥 <b>Turistlar soni:</b> ${passenger_count} kishi\n` +
      `👤 <b>Buyurtmachi:</b> ${tourist_name}\n\n` +
      `*Ushbu buyurtmani tasdiqlaysizmi?*`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: `confirm_booking:${id}:driver` },
          { text: '❌ Rad etish', callback_data: `reject_booking:${id}:driver` }
        ]
      ]
    };

    await sendTelegramMessage(vehicle.telegram_chat_id, text, replyMarkup);
    console.log(`Telegram notification sent to Driver: ${vehicle.driver_name} (chat_id: ${vehicle.telegram_chat_id})`);
  }
}
