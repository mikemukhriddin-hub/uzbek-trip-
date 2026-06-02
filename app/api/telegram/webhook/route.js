import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { sendTelegramMessage, editTelegramMessageText } from '@/lib/telegram';

// Normalizes phone numbers by stripping everything except digits
function normalizePhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export async function POST(req) {
  // Validate Webhook Token if configured
  const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  
  if (expectedToken && secretToken !== expectedToken) {
    return NextResponse.json({ message: 'Unauthorized webhook request' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // 1. Process Messages (Text commands or shared contacts)
    if (body.message) {
      const message = body.message;
      const chatId = message.chat.id;

      // Handle contact sharing
      if (message.contact) {
        const rawPhone = message.contact.phone_number;
        const normalizedPhone = normalizePhoneNumber(rawPhone);

        if (!supabaseConfigured) {
          // Mock mode response
          await sendTelegramMessage(chatId, `<b>[MOCK MODE]</b> Kontakt qabul qilindi: <code>+${normalizedPhone}</code>. Tizimga muvaffaqiyatli ulandingiz!`);
          return NextResponse.json({ ok: true });
        }

        // Query guides table
        const { data: guide, error: guideError } = await supabase
          .from('guides')
          .select('id, full_name, phone_number')
          .eq('phone_number', rawPhone) // exact match or like query
          .maybeSingle();

        if (guideError) console.error('Guide check error:', guideError);

        if (guide) {
          // Bind guide to chat ID
          const { error: updateError } = await supabase
            .from('guides')
            .update({ telegram_chat_id: chatId, bot_active: true })
            .eq('id', guide.id);

          if (updateError) throw updateError;

          await sendTelegramMessage(
            chatId,
            `🎉 <b>Assalomu alaykum, ${guide.full_name}!</b>\n\nSizning gid profilingiz Telegram botga muvaffaqiyatli bog'landi. Endi yangi buyurtmalar haqida shu yerda xabar olasiz.`,
            { remove_keyboard: true }
          );
          return NextResponse.json({ ok: true });
        }

        // Query vehicles (drivers) table if not a guide
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, driver_name, driver_phone')
          .eq('driver_phone', rawPhone)
          .maybeSingle();

        if (vehicleError) console.error('Vehicle check error:', vehicleError);

        if (vehicle) {
          // Bind vehicle to chat ID
          const { error: updateError } = await supabase
            .from('vehicles')
            .update({ telegram_chat_id: chatId, bot_active: true })
            .eq('id', vehicle.id);

          if (updateError) throw updateError;

          await sendTelegramMessage(
            chatId,
            `🎉 <b>Assalomu alaykum, ${vehicle.driver_name}!</b>\n\nSizning haydovchi profilingiz Telegram botga muvaffaqiyatli bog'landi. Yangi sayohat buyurtmalari haqida shu yerda xabar olasiz.`,
            { remove_keyboard: true }
          );
          return NextResponse.json({ ok: true });
        }

        // Phone number not found in DB
        await sendTelegramMessage(
          chatId,
          `❌ <b>Kechirasiz!</b>\n\nSizning telefon raqamingiz (<code>+${normalizedPhone}</code>) tizimda ro'yxatdan o'tmagan. Iltimos, administrator bilan bog'laning.`,
          { remove_keyboard: true }
        );
        return NextResponse.json({ ok: true });
      }

      // Handle /start or other text commands
      if (message.text && message.text.startsWith('/start')) {
        await sendTelegramMessage(
          chatId,
          `🇺🇿 <b>Samarqand CrafTour - Hamkorlar Tizimi</b>\n\nYangi buyurtmalarni qabul qilish uchun pastdagi tugmani bosib telefon raqamingizni ulashing:`,
          {
            keyboard: [
              [{ text: '📱 Raqamni ulashish (Share Contact)', request_contact: true }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        );
        return NextResponse.json({ ok: true });
      }
    }

    // 2. Process Callback Queries (inline button clicks)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;
      const callbackData = callbackQuery.data; // confirm_booking:[id]:[role] or reject_booking:[id]:[role]
      const callbackQueryId = callbackQuery.id;

      const parts = callbackData.split(':');
      if (parts.length === 3) {
        const action = parts[0];
        const bookingId = parseInt(parts[1], 10);
        const role = parts[2]; // 'guide' or 'driver'

        if (!supabaseConfigured) {
          // Mock mode response
          const confirmationText = action === 'confirm_booking' ? '✅ Tasdiqlandi (Mock Mode)' : '❌ Rad etildi (Mock Mode)';
          await editTelegramMessageText(chatId, messageId, `<b>[MOCK MODE]</b> Sayohat buyurtmasi: ${confirmationText}`);
          return NextResponse.json({ ok: true });
        }

        // Fetch current booking details
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();

        if (fetchError || !booking) {
          console.error('Fetch booking error:', fetchError);
          // Answer callback to stop loading spinner
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackQueryId, text: 'Buyurtma topilmadi!' })
          });
          return NextResponse.json({ ok: true });
        }

        const isConfirm = action === 'confirm_booking';
        const responseValue = isConfirm ? 'confirmed' : 'rejected';

        // Update fields based on role
        const updates = {};
        if (role === 'guide') {
          updates.guide_response = responseValue;
        } else if (role === 'driver') {
          updates.vehicle_response = responseValue;
        }

        // Save response in Supabase
        const { error: updateError } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', bookingId);

        if (updateError) throw updateError;

        // Auto-confirm booking if conditions are met
        // Trigger condition:
        // - No guide is selected -> only driver needs to confirm.
        // - Guide is selected -> both guide and driver must confirm.
        let finalStatusUpdateText = '';
        const { data: freshBooking } = await supabase
          .from('bookings')
          .select('guide_id, guide_response, vehicle_response, status')
          .eq('id', bookingId)
          .single();

        if (freshBooking) {
          const hasGuide = freshBooking.guide_id !== null;
          const driverOk = freshBooking.vehicle_response === 'confirmed';
          const guideOk = freshBooking.guide_response === 'confirmed';
          const anyReject = freshBooking.vehicle_response === 'rejected' || freshBooking.guide_response === 'rejected';

          if (anyReject) {
            // If either rejects, mark overall status as cancelled or pending review?
            // For now, keep as pending but flag rejection in status message.
            finalStatusUpdateText = role === 'guide' ? '❌ Siz bu buyurtmani rad etdingiz. Menejer ogohlantirildi.' : '❌ Siz bu buyurtmani rad etdingiz. Sayohat bekor qilinadi.';
          } else {
            const shouldConfirm = hasGuide ? (driverOk && guideOk) : driverOk;
            if (shouldConfirm && freshBooking.status !== 'confirmed') {
              // Update overall booking status to confirmed
              await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', bookingId);
              finalStatusUpdateText = '✅ Buyurtma to\'liq tasdiqlandi va band qilindi!';
            } else {
              finalStatusUpdateText = isConfirm 
                ? '⏳ Hamkor javobi qabul qilindi. Boshqa tomondan tasdiq kutilyapti...' 
                : '❌ Buyurtma rad etildi.';
            }
          }
        }

        // Tahrirlangan xabarni Telegramda yangilash
        const updatedMessageText = callbackQuery.message.text
          .replace(/\n\n\*Ushbu buyurtmani tasdiqlaysizmi?\*/g, '')
          .concat(`\n\n📌 <b>Sizning javobingiz:</b> ${isConfirm ? 'Tasdiqlash ✅' : 'Rad etish ❌'}\nℹ️ ${finalStatusUpdateText}`);

        await editTelegramMessageText(chatId, messageId, updatedMessageText);

        // Answer callback to stop loading spinner on client
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQueryId, text: isConfirm ? 'Tasdiqlandi!' : 'Rad etildi!' })
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
