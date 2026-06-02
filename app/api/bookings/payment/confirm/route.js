import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateMagicToken } from '@/lib/token';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    const isDbActive = supabaseConfigured && !bypassSupabase;

    const { bookingId, paymentMethod, paymentTxId, depositAmount: clientDepositAmount } = await req.json();

    if (!bookingId || !paymentMethod) {
      return NextResponse.json(
        { message: 'Missing booking ID or payment method.' },
        { status: 400 }
      );
    }

    let bookingDetails = null;
    const key = bookingId.toString();

    // 1. Fetch booking details to verify it exists
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
      } catch (err) {
        console.warn('⚠️ Supabase fetch error in confirm, falling back to mock store:', err.message);
      }
    }

    if (!bookingDetails && global.mockBookingsStore) {
      bookingDetails = global.mockBookingsStore.get(key);
    }

    if (!bookingDetails) {
      return NextResponse.json(
        { message: 'Booking not found.' },
        { status: 404 }
      );
    }

    // 2. Calculate deposit (20%)
    const totalPrice = parseFloat(bookingDetails.total_price || bookingDetails.totalPrice || 0);
    const depositAmount = clientDepositAmount || parseFloat((totalPrice * 0.20).toFixed(2));
    const txId = paymentTxId || `TX-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Update database status
    if (isDbActive) {
      try {
        const updateData = {
          status: 'confirmed',
          payment_status: 'deposit_paid',
          payment_method: paymentMethod,
          deposit_amount: depositAmount,
          payment_tx_id: txId,
          paid_at: new Date().toISOString()
        };

        let { error: updateErr } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId);

        // Fallback if table doesn't have new payment columns yet
        if (updateErr && updateErr.message && (updateErr.message.includes('payment_status') || updateErr.code === 'PGS00' || updateErr.code === '42703')) {
          console.warn('⚠️ Schema migration not fully run. Updating status only.');
          const fallbackData = { status: 'confirmed' };
          const { error: retryErr } = await supabase
            .from('bookings')
            .update(fallbackData)
            .eq('id', bookingId);
          updateErr = retryErr;
        }

        if (updateErr) throw updateErr;
        console.log(`Booking ID #${bookingId} confirmed and marked paid in database.`);
      } catch (dbErr) {
        console.error('Database update failed in confirm API:', dbErr.message);
      }
    }

    // Update in Mock Store
    if (global.mockBookingsStore) {
      const mockRecord = global.mockBookingsStore.get(key);
      if (mockRecord) {
        mockRecord.status = 'confirmed';
        mockRecord.payment_status = 'deposit_paid';
        mockRecord.payment_method = paymentMethod;
        mockRecord.deposit_amount = depositAmount;
        mockRecord.payment_tx_id = txId;
        mockRecord.paid_at = new Date().toISOString();
      }
    }

    // 4. Trigger n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n-instance.com/webhook/craf-tour') {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_verified',
            bookingId,
            details: {
              ...bookingDetails,
              status: 'confirmed',
              payment_status: 'deposit_paid',
              payment_method: paymentMethod,
              deposit_amount: depositAmount,
              payment_tx_id: txId
            },
          }),
        });
        console.log(`n8n payment confirmation sent for Booking ID #${bookingId}`);
      } catch (webhookErr) {
        console.error('Failed triggering n8n webhook:', webhookErr.message);
      }
    }

    // 5. Send Confirmation Email with Magic Link
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const touristName = bookingDetails.tourist_name || 'Valued Guest';
    const touristEmail = bookingDetails.tourist_email || 'guest@example.com';
    const lang = bookingDetails.customer_language || 'EN';

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
                <p style="color: #cbd5e1;">Sizning Samarqand bo'ylab sayohat buyurtmangiz muvaffaqiyatli tasdiqlanganini ma'lum qilishdan mamnunmiz. Depozit to'lovi qabul qilindi!</p>
                
                <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Buyurtma tafsilotlari #${bookingId}</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Sayohat sanasi:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.booking_date || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Gid:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.guide?.full_name || 'Tayinlanadi'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Haydovchi:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.vehicle?.driver_name || 'Tayinlanadi'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Umumiy qiymat:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">$${parseFloat(totalPrice).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">To'langan depozit (20%):</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #10b981;">$${parseFloat(depositAmount).toFixed(2)} (${paymentMethod.toUpperCase()})</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #94a3b8;">Qoldiq (joyida):</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">$${(totalPrice - depositAmount).toFixed(2)}</td>
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
                  <p style="color: #cbd5e1;">Мы рады сообщить, что ваше бронирование тура в Самарканд успешно подтверждено. Предоплата успешно получена!</p>
                  
                  <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Детали бронирования #${bookingId}</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Дата поездки:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.booking_date || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Гид:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.guide?.full_name || 'Будет назначен'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Водитель:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.vehicle?.driver_name || 'Будет назначен'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Итоговая стоимость:</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">$${parseFloat(totalPrice).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Оплаченный депозит (20%):</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #10b981;">$${parseFloat(depositAmount).toFixed(2)} (${paymentMethod.toUpperCase()})</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Остаток к оплате (на месте):</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">$${(totalPrice - depositAmount).toFixed(2)}</td>
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
                  <p style="color: #cbd5e1;">We are thrilled to let you know that your custom tour of Samarkand has been successfully verified and confirmed. Your deposit has been received!</p>
                  
                  <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #d4af37; margin-top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 16px;">Booking Details #${bookingId}</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #ffffff;">
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Travel Date:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.booking_date || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Guide:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.guide?.full_name || 'To be assigned'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Driver:</td>
                        <td style="padding: 6px 0; font-weight: bold;">${bookingDetails.vehicle?.driver_name || 'To be assigned'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Total Price:</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">$${parseFloat(totalPrice).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Deposit Paid (20%):</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #10b981;">$${parseFloat(depositAmount).toFixed(2)} (${paymentMethod.toUpperCase()})</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94a3b8;">Remaining Balance (cash):</td>
                        <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">$${(totalPrice - depositAmount).toFixed(2)}</td>
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

    // Trigger notification processing immediately
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
      message: 'Payment confirmed successfully. Booking active.',
      bookingId,
      paymentMethod,
      depositAmount,
      txId
    });

  } catch (err) {
    console.error('Error in POST /api/bookings/payment/confirm:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
