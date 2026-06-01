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
    if (isDbActive) {
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
        console.warn('⚠️ Supabase schema mismatch or fetch error. Falling back to Mock store data:', err.message);
        // Mock mode fallback
        if (global.mockBookingsStore) {
          const rawMock = global.mockBookingsStore.get(bookingId.toString());
          if (rawMock) {
            bookingDetails = {
              ...rawMock,
              status: 'confirmed',
              guide: { full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
              vehicle: { 
                driver_name: rawMock.vehicle_id === 4 ? 'Odil aka' : (rawMock.vehicle_id === 5 ? 'Jahongir aka' : 'Doston aka'), 
                driver_phone: rawMock.vehicle_id === 4 ? '+998901234567' : (rawMock.vehicle_id === 5 ? '+998909876543' : '+998935554433'), 
                car_model: rawMock.vehicle_id === 4 ? 'Hyundai H1 Minivan (Silver)' : (rawMock.vehicle_id === 5 ? 'Isuzu Bus (Turquoise)' : 'Chevrolet Gentra (Black)'), 
                car_number: rawMock.vehicle_id === 4 ? '01 X 777 XX' : (rawMock.vehicle_id === 5 ? '01 B 999 BB' : '01 Z 888 ZZ'),
                capacity: rawMock.vehicle_id === 4 ? 8 : (rawMock.vehicle_id === 5 ? 20 : 5)
              },
              booking_items: rawMock.locations.map(loc => ({ location_id: loc.locationId }))
            };
          }
        }
      }
    } else {
      // Mock mode: retrieve from global mockBookingsStore
      if (global.mockBookingsStore) {
        const rawMock = global.mockBookingsStore.get(bookingId.toString());
        if (rawMock) {
          bookingDetails = {
            ...rawMock,
            status: 'confirmed',
            guide: { full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
            vehicle: { 
              driver_name: rawMock.vehicle_id === 4 ? 'Odil aka' : (rawMock.vehicle_id === 5 ? 'Jahongir aka' : 'Doston aka'), 
              driver_phone: rawMock.vehicle_id === 4 ? '+998901234567' : (rawMock.vehicle_id === 5 ? '+998909876543' : '+998935554433'), 
              car_model: rawMock.vehicle_id === 4 ? 'Hyundai H1 Minivan (Silver)' : (rawMock.vehicle_id === 5 ? 'Isuzu Bus (Turquoise)' : 'Chevrolet Gentra (Black)'), 
              car_number: rawMock.vehicle_id === 4 ? '01 X 777 XX' : (rawMock.vehicle_id === 5 ? '01 B 999 BB' : '01 Z 888 ZZ'),
              capacity: rawMock.vehicle_id === 4 ? 8 : (rawMock.vehicle_id === 5 ? 20 : 5)
            },
            booking_items: rawMock.locations.map(loc => ({ location_id: loc.locationId }))
          };
        }
      }
    }

    // 1.2 Matching/Pooling algorithm
    let matchedPartner = null;
    let combinedPassengersCount = 0;

    if (bookingDetails) {
      const newLocIds = bookingDetails.booking_items ? bookingDetails.booking_items.map(item => item.location_id) : [];

      if (isDbActive) {
        try {
          // Query other confirmed bookings on the same date and same language
          const { data: activeBookings, error: searchErr } = await supabase
            .from('bookings')
            .select(`
              *,
              guide:guides(full_name, phone_number),
              vehicle:vehicles(capacity, car_model, driver_name, driver_phone),
              booking_items(location_id)
            `)
            .eq('booking_date', bookingDetails.booking_date)
            .eq('customer_language', bookingDetails.customer_language)
            .eq('status', 'confirmed')
            .neq('id', bookingDetails.id);

          if (searchErr) throw searchErr;

          if (activeBookings) {
            for (const candidate of activeBookings) {
              const candidateLocIds = candidate.booking_items ? candidate.booking_items.map(item => item.location_id) : [];
              const isSameRoute = newLocIds.length === candidateLocIds.length && 
                                  newLocIds.every(id => candidateLocIds.includes(id));
              
              if (isSameRoute) {
                const carCapacity = candidate.vehicle?.capacity || 5;
                const totalPassengers = (candidate.passenger_count || 1) + (bookingDetails.passenger_count || 1);

                if (totalPassengers <= carCapacity) {
                  matchedPartner = candidate;
                  combinedPassengersCount = totalPassengers;
                  break;
                }
              }
            }
          }

          // If matched, merge vehicle/driver assignment in Database
          if (matchedPartner) {
            const { error: mergeErr } = await supabase
              .from('bookings')
              .update({
                vehicle_id: matchedPartner.vehicle_id,
                guide_id: matchedPartner.guide_id
              })
              .eq('id', bookingDetails.id);

            if (mergeErr) throw mergeErr;
            console.log(`Successfully merged Booking #${bookingDetails.id} with partner Booking #${matchedPartner.id}`);
            // Update local object representation for notification
            bookingDetails.vehicle_id = matchedPartner.vehicle_id;
            bookingDetails.guide_id = matchedPartner.guide_id;
            bookingDetails.vehicle = matchedPartner.vehicle;
            bookingDetails.guide = matchedPartner.guide;
          }
        } catch (dbErr) {
          console.warn('⚠️ Supabase matching or merge failed. Falling back to Mock Matching instead:', dbErr.message);
          // Fall back to Mock matching
          global.mockVerifiedBookings = global.mockVerifiedBookings || [];
          for (const candidate of global.mockVerifiedBookings) {
            if (
              candidate.booking_date === bookingDetails.booking_date &&
              candidate.customer_language === bookingDetails.customer_language &&
              candidate.id !== bookingDetails.id
            ) {
              const candidateLocIds = candidate.booking_items ? candidate.booking_items.map(item => item.location_id) : [];
              const isSameRoute = newLocIds.length === candidateLocIds.length && 
                                  newLocIds.every(id => candidateLocIds.includes(id));

              if (isSameRoute) {
                const carCapacity = candidate.vehicle?.capacity || 5;
                const totalPassengers = (candidate.passenger_count || 1) + (bookingDetails.passenger_count || 1);

                if (totalPassengers <= carCapacity) {
                  matchedPartner = candidate;
                  combinedPassengersCount = totalPassengers;
                  break;
                }
              }
            }
          }

          if (matchedPartner) {
            bookingDetails.vehicle_id = matchedPartner.vehicle_id;
            bookingDetails.guide_id = matchedPartner.guide_id;
            bookingDetails.vehicle = matchedPartner.vehicle;
            bookingDetails.guide = matchedPartner.guide;
            console.log(`[Mock Fallback] Successfully merged Booking #${bookingDetails.id} with partner Booking #${matchedPartner.id}`);
          }

          // Save to mock verified bookings list
          global.mockVerifiedBookings.push(bookingDetails);
        }
      } else {
        // Mock matching
        global.mockVerifiedBookings = global.mockVerifiedBookings || [];
        for (const candidate of global.mockVerifiedBookings) {
          if (
            candidate.booking_date === bookingDetails.booking_date &&
            candidate.customer_language === bookingDetails.customer_language &&
            candidate.id !== bookingDetails.id
          ) {
            const candidateLocIds = candidate.booking_items ? candidate.booking_items.map(item => item.location_id) : [];
            const isSameRoute = newLocIds.length === candidateLocIds.length && 
                                newLocIds.every(id => candidateLocIds.includes(id));

            if (isSameRoute) {
              const carCapacity = candidate.vehicle?.capacity || 5;
              const totalPassengers = (candidate.passenger_count || 1) + (bookingDetails.passenger_count || 1);

              if (totalPassengers <= carCapacity) {
                matchedPartner = candidate;
                combinedPassengersCount = totalPassengers;
                break;
              }
            }
          }
        }

        if (matchedPartner) {
          bookingDetails.vehicle_id = matchedPartner.vehicle_id;
          bookingDetails.guide_id = matchedPartner.guide_id;
          bookingDetails.vehicle = matchedPartner.vehicle;
          bookingDetails.guide = matchedPartner.guide;
          console.log(`[Mock] Successfully merged Booking #${bookingDetails.id} with partner Booking #${matchedPartner.id}`);
        }

        // Save to mock verified bookings
        global.mockVerifiedBookings.push(bookingDetails);
      }
    }

    // 1.5 Send Telegram alert directly via Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    let tgText = '';
    if (bookingDetails) {
      if (matchedPartner) {
        const capacity = matchedPartner.vehicle?.capacity || 5;
        const driverName = matchedPartner.vehicle?.driver_name || 'N/A';
        const carModel = matchedPartner.vehicle?.car_model || 'N/A';
        const guideName = bookingDetails.guide?.full_name || 'N/A';
        
        tgText = `🚗 *HAMKORLIKDAGI GURUH SAYOHATI! (TOUR POOLING)* 🚗\n\n` +
          `📅 *Sana:* ${bookingDetails.booking_date}\n` +
          `💬 *Til:* ${bookingDetails.customer_language}\n` +
          `🚗 *Mashina:* ${carModel} (${driverName})\n` +
          `👤 *Gid:* ${guideName}\n` +
          `👥 *Band sig'im:* ${combinedPassengersCount}/${capacity} kishi\n\n` +
          `====================================\n` +
          `👤 *1-Sayohatchi (${matchedPartner.passenger_count || 1} kishi):* ${matchedPartner.tourist_name}\n` +
          `📞 *Tel/WhatsApp:* ${matchedPartner.tourist_phone}\n` +
          `📧 *Email:* ${matchedPartner.tourist_email}\n` +
          `💵 *Narxi:* $${matchedPartner.total_price || 'N/A'}\n\n` +
          `👤 *2-Sayohatchi (${bookingDetails.passenger_count || 1} kishi):* ${bookingDetails.tourist_name}\n` +
          `📞 *Tel/WhatsApp:* ${bookingDetails.tourist_phone}\n` +
          `📧 *Email:* ${bookingDetails.tourist_email}\n` +
          `💵 *Narxi:* $${bookingDetails.total_price || 'N/A'}\n` +
          `====================================\n\n` +
          `🔗 *WhatsApp orqali bog'lanish:* \n` +
          `1-Sayyoh: https://wa.me/${(matchedPartner.tourist_phone || '').replace(/\+/g, '')}\n` +
          `2-Sayyoh: https://wa.me/${(bookingDetails.tourist_phone || '').replace(/\+/g, '')}`;
      } else {
        const touristName = bookingDetails?.tourist_name || 'N/A';
        const touristEmail = bookingDetails?.tourist_email || 'N/A';
        const touristPhone = bookingDetails?.tourist_phone || 'N/A';
        const bookingDate = bookingDetails?.booking_date || 'N/A';
        const customerLang = bookingDetails?.customer_language || 'EN';
        const guideName = bookingDetails?.guide?.full_name || 'N/A';
        const driverName = bookingDetails?.vehicle?.driver_name || 'N/A';
        const carModel = bookingDetails?.vehicle?.car_model || 'N/A';
        const totalPrice = bookingDetails?.total_price ? `$${bookingDetails.total_price}` : 'N/A';
        const pCount = bookingDetails?.passenger_count || 1;

        tgText = `🚨 *NEW BOOKING VERIFIED!* 🚨\n\n` +
          `👤 *Tourist:* ${touristName} (${pCount} ${pCount === 1 ? 'person' : 'people'})\n` +
          `📧 *Email:* ${touristEmail}\n` +
          `📞 *Phone/WhatsApp:* ${touristPhone}\n` +
          `📅 *Date:* ${bookingDate}\n` +
          `💬 *Language:* ${customerLang}\n\n` +
          `👤 *Guide:* ${guideName}\n` +
          `🚗 *Driver:* ${driverName} (${carModel})\n` +
          `💵 *Total Price:* ${totalPrice}\n\n` +
          `🔗 *Action Required:* Contact the tourist on WhatsApp:\n` +
          `https://wa.me/${touristPhone.replace(/\+/g, '')}`;
      }
    }

    // Always log the built Telegram text for debugging / verification
    console.log('==========================================');
    console.log('🕌 TELEGRAM NOTIFICATION ALERTS BROADCAST:');
    console.log(tgText);
    console.log('==========================================');

    if (botToken && chatId && tgText) {
      try {
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
        const emailSubject = lang === 'RU' 
          ? 'Ваше путешествие с Samarqand CrafTour подтверждено!'
          : 'Your Samarqand CrafTour Booking is Confirmed!';
          
        const emailHtml = lang === 'RU'
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
