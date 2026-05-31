import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { bookingId, code } = await req.json();

    if (!bookingId || !code) {
      return NextResponse.json(
        { message: 'Missing booking ID or verification code.' },
        { status: 400 }
      );
    }

    const key = bookingId.toString();
    const stored = global.otpStore ? global.otpStore.get(key) : null;

    // Check if OTP exists and is valid
    if (!stored) {
      return NextResponse.json(
        { message: 'Verification code not found or has expired.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiry) {
      global.otpStore.delete(key);
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { message: 'Incorrect verification code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid! Remove it from store
    global.otpStore.delete(key);

    // 0. Update booking status to 'confirmed' in database
    if (supabaseConfigured) {
      try {
        const { error: updateErr } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);
        
        if (updateErr) {
          console.error('Error updating booking status to confirmed:', updateErr);
        } else {
          console.log(`Booking ID #${bookingId} status updated to confirmed in database.`);
        }
      } catch (updateErr) {
        console.error('Failed updating status in database:', updateErr.message);
      }
    }

    let bookingDetails = null;

    // 1. Fetch booking details to send notifications
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

      if (fetchErr) {
        console.error('Error fetching verified booking details:', fetchErr);
      } else {
        bookingDetails = booking;
      }
    }

    // 1.5 Send Telegram alert directly via Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      try {
        const touristName = bookingDetails?.tourist_name || 'N/A';
        const touristEmail = bookingDetails?.tourist_email || 'N/A';
        const touristPhone = bookingDetails?.tourist_phone || 'N/A';
        const bookingDate = bookingDetails?.booking_date || 'N/A';
        const customerLang = bookingDetails?.customer_language || 'EN';
        const guideName = bookingDetails?.guide?.full_name || 'N/A';
        const driverName = bookingDetails?.vehicle?.driver_name || 'N/A';
        const carModel = bookingDetails?.vehicle?.car_model || 'N/A';
        const totalPrice = bookingDetails?.total_price ? `$${bookingDetails.total_price}` : 'N/A';

        const tgText = `🚨 *NEW BOOKING VERIFIED!* 🚨\n\n` +
          `👤 *Tourist:* ${touristName}\n` +
          `📧 *Email:* ${touristEmail}\n` +
          `📞 *Phone/WhatsApp:* ${touristPhone}\n` +
          `📅 *Date:* ${bookingDate}\n` +
          `💬 *Language:* ${customerLang}\n\n` +
          `👤 *Guide:* ${guideName}\n` +
          `🚗 *Driver:* ${driverName} (${carModel})\n` +
          `💵 *Total Price:* ${totalPrice}\n\n` +
          `🔗 *Action Required:* Contact the tourist on WhatsApp:\n` +
          `https://wa.me/${touristPhone.replace(/\+/g, '')}`;

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgText,
            parse_mode: 'Markdown'
          })
        });

        if (tgRes.ok) {
          console.log(`Telegram notification successfully sent for Booking ID #${bookingId}`);
        } else {
          const tgErr = await tgRes.json();
          console.error('Failed sending Telegram notification:', tgErr);
        }
      } catch (tgErr) {
        console.error('Error sending Telegram notification:', tgErr.message);
      }
    } else {
      console.log('Telegram credentials not configured. Skipping direct notification.');
    }

    // 2. Trigger n8n webhook for backward compatibility
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n-instance.com/webhook/craf-tour') {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_verified',
            bookingId,
            details: bookingDetails || { id: bookingId, status: 'confirmed' },
          }),
        });
        console.log(`n8n verification notification sent for Booking ID #${bookingId}`);
      } catch (webhookErr) {
        console.error('Failed triggering n8n verification webhook:', webhookErr.message);
      }
    }

    return NextResponse.json({
      message: 'Email successfully verified. Booking submitted for review.',
      bookingId,
    });

  } catch (err) {
    console.error('Error in POST /api/bookings/verify:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
