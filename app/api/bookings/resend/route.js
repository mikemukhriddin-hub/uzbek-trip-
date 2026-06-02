import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { message: 'Missing booking ID.' },
        { status: 400 }
      );
    }

    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    let isDbActive = supabaseConfigured && !bypassSupabase;

    let bookingDetails = null;
    let cleanTouristName = 'Guest';

    // 1. Fetch current booking details
    if (isDbActive) {
      try {
        const { data: booking, error: fetchErr } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (fetchErr || !booking) {
          console.warn('Booking not found in DB:', fetchErr);
        } else {
          bookingDetails = booking;
        }
      } catch (err) {
        console.warn('Database error while fetching booking:', err.message);
        isDbActive = false;
      }
    }

    // Fallback to Mock Store if offline/not found
    if (!bookingDetails && global.mockBookingsStore) {
      bookingDetails = global.mockBookingsStore.get(bookingId.toString());
    }

    if (!bookingDetails) {
      return NextResponse.json(
        { message: 'Booking not found.' },
        { status: 404 }
      );
    }

    // Check if booking is already confirmed
    if (bookingDetails.status === 'confirmed') {
      return NextResponse.json(
        { message: 'Booking is already verified and confirmed.' },
        { status: 400 }
      );
    }

    // Extract clean tourist name
    const rawName = bookingDetails.tourist_name || 'Guest';
    const match = rawName.match(/(.*?)\|\|OTP:(\d{6})/);
    if (match) {
      cleanTouristName = match[1];
    } else {
      cleanTouristName = rawName.replace(/\|\|OTP:\d{6}/, '');
    }

    // 2. Generate a new 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Update database or mock store
    if (isDbActive) {
      try {
        const { error: updateErr } = await supabase
          .from('bookings')
          .update({
            tourist_name: `${cleanTouristName}||OTP:${otpCode}`,
            created_at: new Date().toISOString() // refresh timestamp for 2-min expiry window
          })
          .eq('id', bookingId);

        if (updateErr) throw updateErr;
      } catch (dbErr) {
        console.warn('Failed to update resend OTP in DB:', dbErr.message);
      }
    } else {
      if (global.mockBookingsStore) {
        const rawMock = global.mockBookingsStore.get(bookingId.toString());
        if (rawMock) {
          rawMock.tourist_name = cleanTouristName;
        }
      }
    }

    // Update in-memory OTP store
    const expiry = Date.now() + 2 * 60 * 1000; // 2 minutes
    global.otpStore = global.otpStore || new Map();
    global.otpStore.set(bookingId.toString(), { code: otpCode, expiry });

    console.log('==========================================');
    console.log(`🔑 Resent Verification OTP for Booking ID #${bookingId}: ${otpCode}`);
    console.log('==========================================');

    const lang = bookingDetails.customer_language || 'EN';
    const touristEmail = bookingDetails.tourist_email;

    // 4. Send Email via Gmail SMTP
    let emailSent = false;
    let emailError = null;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (smtpUser && smtpPassword && touristEmail) {
      try {
        const emailSubject = lang === 'UZ'
          ? 'Samarqand CrafTour - Yangi tasdiqlash kodi'
          : lang === 'RU'
            ? 'Samarqand CrafTour - Новый код подтверждения'
            : 'Samarqand CrafTour - New Verification Code';

        const emailHtml = lang === 'UZ'
          ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
              <p>Assalomu alaykum, <strong>${cleanTouristName}</strong>!</p>
              <p>Siz yangi tasdiqlash kodini so'radingiz.</p>
              <p>Elektron pochta manzilingizni tasdiqlash uchun quyidagi yangi koddan foydalaning:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                ${otpCode}
              </div>
              <p>Ushbu kod 2 daqiqa davomida amal qiladi.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Agar siz ushbu kodni so'ramagan bo'lsangiz, xabarni shunchaki e'tiborsiz qoldiring.</p>
            </div>`
          : lang === 'RU'
            ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
                <p>Здравствуйте, <strong>${cleanTouristName}</strong>!</p>
                <p>Вы запросили новый код подтверждения.</p>
                <p>Пожалуйста, используйте следующий новый код для подтверждения вашего адреса электронной почты:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                  ${otpCode}
                </div>
                <p>Этот код действителен в течение 2 минут.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
              </div>`
            : `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
                <p>Hello <strong>${cleanTouristName}</strong>,</p>
                <p>You requested a new verification code.</p>
                <p>Please use the following new verification code to confirm your email address:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                  ${otpCode}
                </div>
                <p>This code is valid for 2 minutes.</p>
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

        emailSent = true;
        console.log(`Resent OTP Email successfully sent to ${touristEmail} via Gmail SMTP.`);
      } catch (emailErr) {
        console.error('Error sending resent email via Gmail SMTP:', emailErr.message);
        emailError = emailErr.message;
      }
    } else {
      emailError = 'SMTP credentials or tourist email missing';
    }

    // 5. Trigger n8n Webhook Node
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n-instance.com/webhook/craf-tour') {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_otp_resent',
            bookingId,
            touristName: cleanTouristName,
            touristEmail,
            customerLanguage: lang,
            otpCode,
          }),
        });
      } catch (webhookErr) {
        console.error('Failed triggering n8n webhook for resend:', webhookErr.message);
      }
    }

    return NextResponse.json({
      message: emailSent ? 'New verification code sent.' : 'Verification code generated, email failed to send.',
      bookingId,
      emailSent,
      emailError,
      otpCode,
    });

  } catch (err) {
    console.error('Error in POST /api/bookings/resend:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
