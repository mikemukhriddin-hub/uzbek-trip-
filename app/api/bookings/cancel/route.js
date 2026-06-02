import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { validateMagicToken } from '@/lib/token';

const MOCK_EMAIL = 'john@example.com';

export async function POST(req) {
  try {
    const { bookingId, token } = await req.json();

    if (!bookingId || !token) {
      return NextResponse.json(
        { message: 'Missing booking ID or token.' },
        { status: 400 }
      );
    }

    let bookingDetails = null;

    // 1. Fetch booking details to verify it exists and get email for validation
    if (supabaseConfigured) {
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select(`
          *,
          guide:guides(full_name, phone_number),
          vehicle:vehicles(driver_name, driver_phone, car_model, car_number)
        `)
        .eq('id', bookingId)
        .single();

      if (fetchErr || !booking) {
        console.error('Error fetching booking details for cancellation:', fetchErr);
        return NextResponse.json(
          { message: 'Booking not found.' },
          { status: 404 }
        );
      }
      bookingDetails = booking;
    }

    // 2. Validate token
    const touristEmail = supabaseConfigured ? bookingDetails.tourist_email : MOCK_EMAIL;
    const isValid = validateMagicToken(bookingId, touristEmail, token);
    if (!isValid) {
      return NextResponse.json({ message: 'Forbidden: Invalid token.' }, { status: 403 });
    }

    // 3. Update booking status to 'cancelled'
    if (supabaseConfigured) {
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (updateErr) {
        throw updateErr;
      }
    }

    // 4. Send Telegram alert notifying about cancellation
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      try {
        const touristName = supabaseConfigured ? bookingDetails?.tourist_name : 'John Doe';
        const bookingDate = supabaseConfigured ? bookingDetails?.booking_date : '2026-06-01';
        const guideName = supabaseConfigured ? bookingDetails?.guide?.full_name : 'Sherzod Alimov';
        const driverName = supabaseConfigured ? bookingDetails?.vehicle?.driver_name : 'Alisher aka';
        const totalPrice = supabaseConfigured ? `$${bookingDetails?.total_price}` : '$135.00';

        const tgText = `❌ *MIJOZ TOMONIDAN SAYOHAT BEKOR QILINDI* ❌\n\n` +
          `🆔 *Buyurtma ID:* #${bookingId}\n` +
          `👤 *Sayyoh:* ${touristName}\n` +
          `📅 *Sana:* ${bookingDate}\n\n` +
          `👤 *Tayinlangan gid:* ${guideName}\n` +
          `🚗 *Tayinlangan haydovchi:* ${driverName}\n` +
          `💵 *Umumiy narx:* ${totalPrice}\n\n` +
          `⚠️ *Holat:* Ma'lumotlar bazasida buyurtma muvaffaqiyatli bekor qilindi. Gid va haydovchi jadvalidan bo'shatildi.`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgText,
            parse_mode: 'Markdown'
          })
        });
      } catch (tgErr) {
        console.error('Error sending Telegram cancellation notification:', tgErr.message);
      }
    }

    return NextResponse.json({
      message: 'Booking successfully cancelled.',
      bookingId,
    });

  } catch (err) {
    console.error('Error in POST /api/bookings/cancel:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
