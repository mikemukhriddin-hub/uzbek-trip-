import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// In-memory OTP store (global to survive Next.js dev hot-reloads in local environment)
global.otpStore = global.otpStore || new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      touristName,
      touristEmail,
      touristPhone,
      bookingDate,
      guideId,
      vehicleId,
      totalPrice,
      customerLanguage,
      locations,
    } = body;

    // Basic Validation
    if (!touristName || !touristEmail || !bookingDate || !guideId || !vehicleId) {
      return NextResponse.json(
        { message: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    const lang = customerLanguage || 'EN';

    // 1. Double-booking prevention check (Availability Check)
    if (supabaseConfigured) {
      // Check if guide is already booked on this date
      const { data: guideBookings, error: guideErr } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', bookingDate)
        .eq('guide_id', guideId)
        .neq('status', 'cancelled');

      if (guideErr) throw guideErr;

      // Check if driver/vehicle is already booked on this date
      const { data: vehicleBookings, error: vehicleErr } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', bookingDate)
        .eq('vehicle_id', vehicleId)
        .neq('status', 'cancelled');

      if (vehicleErr) throw vehicleErr;

      if (guideBookings.length > 0 || vehicleBookings.length > 0) {
        const errorMsg = lang === 'RU'
          ? 'Выбранный гид или водитель уже заняты на эту дату. Пожалуйста, выберите другого гида/водителя или измените дату поездки.'
          : 'The selected guide or driver is already booked on this date. Please choose another date or service provider.';
        return NextResponse.json({ message: errorMsg }, { status: 409 });
      }
    }

    // 2. Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    let bookingId;

    if (supabaseConfigured) {
      // Create main booking row
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          tourist_name: touristName,
          tourist_email: touristEmail,
          tourist_phone: touristPhone,
          guide_id: guideId,
          vehicle_id: vehicleId,
          total_price: totalPrice,
          booking_date: bookingDate,
          customer_language: lang,
          status: 'pending',
        })
        .select('id')
        .single();

      if (bookingErr) throw bookingErr;
      bookingId = booking.id;

      // Insert locations into booking_items
      if (locations && locations.length > 0) {
        const items = locations.map((loc) => ({
          booking_id: bookingId,
          location_id: loc.locationId,
          visit_order: loc.visitOrder,
        }));

        const { error: itemsErr } = await supabase
          .from('booking_items')
          .insert(items);

        if (itemsErr) throw itemsErr;
      }
    } else {
      // Mock Booking ID for testing without Supabase
      bookingId = Math.floor(10000 + Math.random() * 90000);
      console.log('--- Offline Mock Mode Activated ---');
      console.log(`Mock Booking created: ID=${bookingId}, Date=${bookingDate}`);
    }

    // 3. Store OTP in global memory with 10 minutes lifespan
    const expiry = Date.now() + 10 * 60 * 1000;
    global.otpStore.set(bookingId.toString(), { code: otpCode, expiry });

    // Output OTP directly to terminal logs for easy developer access
    console.log('==========================================');
    console.log(`🔑 Verification OTP for Booking ID #${bookingId}: ${otpCode}`);
    console.log('==========================================');

    // 3.5 Send OTP email directly via Gmail SMTP (Nodemailer)
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    if (smtpUser && smtpPassword) {
      try {
        const emailSubject = lang === 'RU' 
          ? 'Samarqand CrafTour - Подтверждение заказа'
          : 'Samarqand CrafTour - Booking Verification';
          
        const emailHtml = lang === 'RU'
          ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
              <p>Здравствуйте, <strong>${touristName}</strong>!</p>
              <p>Спасибо за создание маршрута для вашего путешествия в Самарканд.</p>
              <p>Пожалуйста, используйте следующий код для подтверждения вашего адреса электронной почты:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                ${otpCode}
              </div>
              <p>Этот код действителен в течение 10 минут.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
            </div>`
          : `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
              <p>Hello <strong>${touristName}</strong>,</p>
              <p>Thank you for crafting your custom tour of Samarkand.</p>
              <p>Please use the following verification code to confirm your email address:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                ${otpCode}
              </div>
              <p>This code is valid for 10 minutes.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email.</p>
            </div>`;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPassword
          }
        });

        await transporter.sendMail({
          from: `"Samarqand CrafTour" <${smtpUser}>`,
          to: touristEmail,
          subject: emailSubject,
          html: emailHtml
        });

        console.log(`OTP Email successfully sent to ${touristEmail} via Gmail SMTP.`);
      } catch (emailErr) {
        console.error('Error sending email via Gmail SMTP:', emailErr.message);
      }
    } else {
      console.log('SMTP credentials not configured. Skipping direct email sending.');
    }

    // 4. Trigger n8n Webhook Node
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n-instance.com/webhook/craf-tour') {
      try {
        // Send details to n8n Webhook
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_created',
            bookingId,
            touristName,
            touristEmail,
            touristPhone,
            bookingDate,
            totalPrice,
            customerLanguage: lang,
            otpCode,
          }),
        });
        console.log(`n8n webhook triggered for Booking ID #${bookingId}`);
      } catch (webhookErr) {
        console.error('Failed triggering n8n webhook:', webhookErr.message);
      }
    } else {
      console.log('N8N_WEBHOOK_URL not configured. Skipping webhook trigger.');
    }

    return NextResponse.json({
      message: 'Booking created, verification code sent.',
      bookingId,
    });

  } catch (err) {
    console.error('Error in POST /api/bookings:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
