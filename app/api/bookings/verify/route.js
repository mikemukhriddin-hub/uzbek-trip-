import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateMagicToken } from '@/lib/token';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    const isDbActive = supabaseConfigured && !bypassSupabase;

    const { bookingId, code } = await req.json();

    if (!bookingId || !code) {
      return NextResponse.json(
        { message: 'Missing booking ID or verification code.' },
        { status: 400 }
      );
    }

    const key = bookingId.toString();
    let storedCode = null;
    let expiry = null;
    let cleanTouristName = null;

    // Try global.otpStore first (useful for memory-based / local mock dev flow)
    const stored = global.otpStore ? global.otpStore.get(key) : null;
    if (stored) {
      storedCode = stored.code;
      expiry = stored.expiry;
    }

    let bookingDetails = null;

    // 1. Fetch booking details to get emails and verify OTP (from tourist_name suffix if stateless)
    if (isDbActive) {
      try {
        const { data: booking, error: fetchErr } = await supabase
          .from('bookings')
          .select(`
            *,
            guide:guides(full_name, phone_number),
            vehicle:vehicles(driver_name, driver_phone, car_model, car_number, capacity),
            booking_items(location_id)
          `)
          .eq('id', bookingId)
          .single();

        if (fetchErr) throw fetchErr;
        bookingDetails = booking;

        // If not found in memory store, try extracting OTP from tourist_name
        if (!storedCode && bookingDetails && bookingDetails.tourist_name) {
          const match = bookingDetails.tourist_name.match(/(.*?)\|\|OTP:(\d{6})/);
          if (match) {
            cleanTouristName = match[1];
            storedCode = match[2];
            // Expiry is 10 minutes from created_at
            const createdAtTime = new Date(bookingDetails.created_at || Date.now()).getTime();
            expiry = createdAtTime + 10 * 60 * 1000;
          }
        }
      } catch (err) {
        console.warn('⚠️ Supabase schema mismatch or fetch error. Falling back to Mock store data:', err.message);
      }
    }

    // Fallback to Mock Store if no details yet
    if (!bookingDetails && global.mockBookingsStore) {
      bookingDetails = global.mockBookingsStore.get(key);
    }

    // Check if OTP was found at all
    if (!storedCode) {
      return NextResponse.json(
        { message: 'Verification code not found or has expired.' },
        { status: 400 }
      );
    }

    // Check if expired
    if (Date.now() > expiry) {
      if (global.otpStore) {
        global.otpStore.delete(key);
      }
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if incorrect
    if (storedCode !== code) {
      return NextResponse.json(
        { message: 'Incorrect verification code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid! Clean up memory store
    if (global.otpStore) {
      global.otpStore.delete(key);
    }

    // 0. Update booking status to 'confirmed' and clear the OTP suffix in database
    if (isDbActive) {
      try {
        const updateData = {
          status: 'confirmed',
          verified_at: new Date().toISOString()
        };

        let nameToUpdate = cleanTouristName;
        if (!nameToUpdate && bookingDetails && bookingDetails.tourist_name) {
          nameToUpdate = bookingDetails.tourist_name.replace(/\|\|OTP:\d{6}/, '');
        }

        if (nameToUpdate) {
          updateData.tourist_name = nameToUpdate;
          if (bookingDetails) {
            bookingDetails.tourist_name = nameToUpdate;
          }
        }

        const { error: updateErr } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId);
        
        if (updateErr) {
          console.error('Error updating booking status to confirmed:', updateErr);
        } else {
          console.log(`Booking ID #${bookingId} status updated to confirmed in database.`);
        }
      } catch (updateErr) {
        console.error('Failed updating status in database:', updateErr.message);
      }
    } else {
      // Mock mode fallback / offline verify
      if (global.mockBookingsStore) {
        const rawMock = global.mockBookingsStore.get(bookingId.toString());
        if (rawMock) {
          rawMock.status = 'confirmed';
          rawMock.verified_at = new Date().toISOString();
          rawMock.notification_sent = false;
        }
      }
    }
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

    // 3. Send Booking Confirmation Email with Magic Link
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    
    const touristName = bookingDetails?.tourist_name || 'Valued Guest';
    const touristEmail = bookingDetails?.tourist_email || 'guest@example.com';
    const lang = bookingDetails?.customer_language || 'EN';
    
    const token = generateMagicToken(bookingId, touristEmail);
    const requestUrl = new URL(req.url);
    const protocol = requestUrl.protocol;
    const host = requestUrl.host;
    const baseUrl = `${protocol}//${host}`;
    const magicLink = `${baseUrl}/my-tour?id=${bookingId}&token=${token}`;
    
    console.log('==========================================');
    console.log(`🔗 Magic Link for Booking ID #${bookingId}: ${magicLink}`);
    console.log('==========================================');

    if (smtpUser && smtpPassword) {
      try {
        const emailSubject = lang === 'UZ'
          ? 'Samarqand CrafTour sayohatingiz tasdiqlandi!'
          : lang === 'RU' 
            ? 'Ваше путешествие с Samarqand CrafTour подтверждено!'
            : 'Your Samarqand CrafTour Booking is Confirmed!';
          
        const emailHtml = lang === 'UZ'
          ? `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f1d; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
              <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 2px solid #d4af37;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 700;">SAMARQAND CRAFTOUR</h1>
                <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Shaxsiy sayohatingiz tasdiqlandi</p>
              </div>
              
              <div style="padding: 30px; line-height: 1.6;">
                <p style="font-size: 16px; margin-top: 0; color: #ffffff;">Assalomu alaykum, <strong>${touristName}</strong>!</p>
                <p style="color: #cbd5e1;">Sizning Samarqand bo'ylab sayohat buyurtmangiz muvaffaqiyatli tasdiqlanganini ma'lum qilishdan mamnunmiz. Jamoamiz sizga unutilmas taassurotlar ulashishga tayyor!</p>
                
                <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Buyurtma tafsilotlari #${bookingId}</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Sayohat sanasi:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.booking_date || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Gid:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.guide?.full_name || 'Tayinlanadi'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Haydovchi:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.vehicle?.driver_name || 'Tayinlanadi'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Umumiy narx:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #d4af37; font-size: 16px;">$${parseFloat(bookingDetails?.total_price || 135.0).toFixed(2)}</td>
                    </tr>
                  </table>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                  <a href="${magicLink}" style="background-color: #d4af37; color: #0a0f1d; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
                    Tafsilotlar va marshrutni ko'rish
                  </a>
                </p>
                
                <p style="font-size: 13px; color: #94a3b8;">Istalgan vaqtda tur marshrutini ko'rish, gid/haydovchi ma'lumotlarini tekshirish yoki ular bilan bog'lanish uchun yuqoridagi tugmadan foydalaning.</p>
              </div>

              <div style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin: 0;">© ${new Date().getFullYear()} Samarqand CrafTour. Barcha huquqlar himoyalangan.</p>
              </div>
            </div>`
          : lang === 'RU'
            ? `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f1d; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 2px solid #d4af37;">
                  <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 700;">SAMARQAND CRAFTOUR</h1>
                  <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Ваше индивидуальное путешествие подтверждено</p>
                </div>
                
                <div style="padding: 30px; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0; color: #ffffff;">Здравствуйте, <strong>${touristName}</strong>!</p>
                  <p style="color: #cbd5e1;">Мы рады сообщить, что ваше бронирование тура в Самарканд успешно подтверждено. Наша команда готова подарить вам незабываемые впечатления!</p>
                  
                  <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Детали бронирования #${bookingId}</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Дата поездки:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.booking_date || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Гид:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.guide?.full_name || 'Будет назначен'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Водитель:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.vehicle?.driver_name || 'Будет назначен'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Итоговая стоимость:</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #d4af37; font-size: 16px;">$${parseFloat(bookingDetails?.total_price || 135.0).toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="background-color: #d4af37; color: #0a0f1d; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
                      Посмотреть детали и маршрут
                    </a>
                  </p>
                  
                  <p style="font-size: 13px; color: #94a3b8;">Используйте кнопку выше, чтобы в любое время просмотреть маршрут вашего тура, проверить информацию о гиде/водителе или связаться с ними.</p>
                </div>

                <div style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                  <p style="margin: 0;">© ${new Date().getFullYear()} Samarqand CrafTour. Все права защищены.</p>
                </div>
              </div>`
            : `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0f1d; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 2px solid #d4af37;">
                  <h1 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 700;">SAMARQAND CRAFTOUR</h1>
                  <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Your Custom Journey is Confirmed</p>
                </div>
                
                <div style="padding: 30px; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0; color: #ffffff;">Hello <strong>${touristName}</strong>,</p>
                  <p style="color: #cbd5e1;">We are thrilled to let you know that your custom tour of Samarkand has been successfully verified and confirmed. Our team is ready to deliver an exceptional experience!</p>
                  
                  <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Booking Details #${bookingId}</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Travel Date:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.booking_date || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Guide:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.guide?.full_name || 'To be assigned'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Driver:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails?.vehicle?.driver_name || 'To be assigned'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Total Price:</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #d4af37; font-size: 16px;">$${parseFloat(bookingDetails?.total_price || 135.0).toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="background-color: #d4af37; color: #0a0f1d; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
                      View My Tour & Itinerary
                    </a>
                  </p>
                  
                  <p style="font-size: 13px; color: #94a3b8;">Use the button above to view your detailed tour schedule, check guide/driver contact details, or review your customized route at any time.</p>
                </div>

                <div style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                  <p style="margin: 0;">© ${new Date().getFullYear()} Samarqand CrafTour. All rights reserved.</p>
                </div>
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

        console.log(`Confirmation Email with Magic Link successfully sent to ${touristEmail} via Gmail SMTP.`);
      } catch (emailErr) {
        console.error('Error sending confirmation email with Magic Link:', emailErr.message);
      }
    } else {
      console.log('SMTP credentials not configured. Skipping confirmation email sending.');
    }

    // Trigger notification processing immediately after verification
    try {
      await fetch(`${baseUrl}/api/cron/process-notifications`, {
        headers: { 
          'x-bypass-supabase': bypassSupabase ? 'true' : 'false'
        }
      });
      console.log('Notification processor triggered successfully.');
    } catch (err) {
      console.error('Failed to trigger background notification processor:', err.message);
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
