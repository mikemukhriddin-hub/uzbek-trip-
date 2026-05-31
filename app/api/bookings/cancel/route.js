import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { message: 'Missing booking ID.' },
        { status: 400 }
      );
    }

    let bookingDetails = null;

    // 1. Fetch booking details to verify it exists and get names
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

    // 2. Update booking status to 'cancelled'
    if (supabaseConfigured) {
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (updateErr) {
        throw updateErr;
      }
    }

    // 3. Send Telegram alert notifying about cancellation
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      try {
        const touristName = bookingDetails?.tourist_name || 'N/A';
        const bookingDate = bookingDetails?.booking_date || 'N/A';
        const guideName = bookingDetails?.guide?.full_name || 'N/A';
        const driverName = bookingDetails?.vehicle?.driver_name || 'N/A';
        const totalPrice = bookingDetails?.total_price ? `$${bookingDetails.total_price}` : 'N/A';

        const tgText = `❌ *BOOKING CANCELLED BY TOURIST* ❌\n\n` +
          `🆔 *Booking ID:* #${bookingId}\n` +
          `👤 *Tourist:* ${touristName}\n` +
          `📅 *Date:* ${bookingDate}\n\n` +
          `👤 *Assigned Guide:* ${guideName}\n` +
          `🚗 *Assigned Driver:* ${driverName}\n` +
          `💵 *Total Price:* ${totalPrice}\n\n` +
          `⚠️ *Status:* Booking has been successfully cancelled in database. Gid va haydovchi jadvalidan bo'shatildi.`;

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
